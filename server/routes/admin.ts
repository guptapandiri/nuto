import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  createSession,
  destroySession,
  resolveSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  verifyPassword,
  type AdminUser,
} from '../auth.ts';
import { query, queryOne } from '../db.ts';
import { isProduction } from '../env.ts';

type Vars = { Variables: { admin: AdminUser } };
export const admin = new Hono<Vars>();

const ORDER_STATUSES = [
  'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled',
] as const;

/**
 * Failed logins are throttled per email+IP. In-memory is fine for a single
 * instance; move to the database or Redis if this is ever scaled horizontally.
 */
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

function throttleKey(email: string, ip: string): string {
  return `${email.toLowerCase()}|${ip}`;
}

admin.post('/admin/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = z
    .object({ email: z.string().trim().email(), password: z.string().min(1).max(200) })
    .safeParse(body);

  if (!parsed.success) return c.json({ error: 'invalid_credentials' }, 401);

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const key = throttleKey(parsed.data.email, ip);
  const record = attempts.get(key);

  if (record && record.until > Date.now() && record.count >= MAX_ATTEMPTS) {
    return c.json({ error: 'too_many_attempts', retryAfterSeconds: Math.ceil((record.until - Date.now()) / 1000) }, 429);
  }

  const user = await queryOne<{ id: string; email: string; name: string; password_hash: string }>(
    `SELECT id, email, name, password_hash FROM admin_users
      WHERE lower(email) = lower($1) AND is_active`,
    [parsed.data.email],
  );

  const ok = user ? await verifyPassword(parsed.data.password, user.password_hash) : false;

  if (!ok || !user) {
    const next = record && record.until > Date.now() ? record.count + 1 : 1;
    attempts.set(key, { count: next, until: Date.now() + LOCKOUT_MS });
    // Same response whether the user exists or the password is wrong.
    return c.json({ error: 'invalid_credentials' }, 401);
  }

  attempts.delete(key);
  const token = await createSession(user.id, c.req.header('user-agent') ?? '');
  await query(`UPDATE admin_users SET last_login_at = now() WHERE id = $1`, [user.id]);

  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    // The Netlify storefront calls the Cloud Run API from a different origin.
    // Cross-origin credentialed requests require SameSite=None + Secure.
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return c.json({ id: user.id, email: user.email, name: user.name });
});

/** Everything below this line requires a valid session. */
admin.use('/admin/*', async (c, next) => {
  if (c.req.path.endsWith('/admin/login')) return next();

  const token = getCookie(c, SESSION_COOKIE);
  const user = token ? await resolveSession(token) : undefined;
  if (!user) return c.json({ error: 'unauthorised' }, 401);

  c.set('admin', user);
  await next();
});

admin.post('/admin/logout', async (c) => {
  const token = getCookie(c, SESSION_COOKIE);
  if (token) await destroySession(token);
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});

admin.get('/admin/me', (c) => c.json(c.get('admin')));

admin.get('/admin/stats', async (c) => {
  const [totals] = await query<{
    orders: string; revenue: string; pending: string; today: string; todayRevenue: string;
  }>(
    `SELECT count(*)                                                     AS orders,
            COALESCE(sum(total_paise) FILTER (WHERE status <> 'cancelled'), 0) AS revenue,
            count(*) FILTER (WHERE status = 'pending')                   AS pending,
            count(*) FILTER (WHERE created_at >= current_date)           AS today,
            COALESCE(sum(total_paise) FILTER (
              WHERE created_at >= current_date AND status <> 'cancelled'), 0) AS "todayRevenue"
       FROM orders`,
  );

  const byStatus = await query(
    `SELECT status, count(*)::int AS count FROM orders GROUP BY status`,
  );

  const lowStock = await query(
    `SELECT v.id AS sku, f.name || ' · ' || v.grams || 'g' AS name, v.stock
       FROM variants v JOIN flavours f ON f.slug = v.flavour_slug
      WHERE v.stock <= 10 AND v.is_active
      ORDER BY v.stock ASC LIMIT 10`,
  );

  const topSellers = await query(
    `SELECT oi.name, sum(oi.quantity)::int AS units,
            sum(oi.line_total_paise)::bigint AS revenue
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE o.status <> 'cancelled'
      GROUP BY oi.name ORDER BY units DESC LIMIT 6`,
  );

  return c.json({
    orders: Number(totals?.orders ?? 0),
    revenuePaise: Number(totals?.revenue ?? 0),
    pending: Number(totals?.pending ?? 0),
    ordersToday: Number(totals?.today ?? 0),
    revenueTodayPaise: Number(totals?.todayRevenue ?? 0),
    byStatus,
    lowStock,
    topSellers: topSellers.map((row) => ({ ...row, revenue: Number(row['revenue']) })),
  });
});

admin.get('/admin/orders', async (c) => {
  const status = c.req.query('status');
  const search = c.req.query('q')?.trim();
  const limit = Math.min(Number(c.req.query('limit') ?? 50), 200);
  const offset = Math.max(Number(c.req.query('offset') ?? 0), 0);

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    params.push(status);
    conditions.push(`status = $${params.length}::order_status`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(reference ILIKE $${params.length} OR customer_name ILIKE $${params.length}
        OR customer_mobile ILIKE $${params.length} OR customer_email ILIKE $${params.length})`,
    );
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(limit, offset);

  const rows = await query(
    `SELECT o.id, o.reference, o.status, o.payment_method AS "paymentMethod",
            o.payment_status AS "paymentStatus", o.total_paise AS "totalPaise",
            o.customer_name AS "customerName", o.customer_mobile AS "customerMobile",
            o.city, o.state, o.pincode, o.created_at AS "createdAt",
            (SELECT count(*)::int FROM order_items i WHERE i.order_id = o.id) AS "itemCount"
       FROM orders o ${where}
      ORDER BY o.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );

  const [count] = await query<{ total: string }>(
    `SELECT count(*) AS total FROM orders ${where}`,
    params.slice(0, params.length - 2),
  );

  return c.json({ orders: rows, total: Number(count?.total ?? 0), limit, offset });
});

admin.get('/admin/orders/:id', async (c) => {
  const id = c.req.param('id');
  const order = await queryOne(
    `SELECT id, reference, status, payment_method AS "paymentMethod",
            payment_status AS "paymentStatus",
            subtotal_paise AS "subtotalPaise", shipping_paise AS "shippingPaise",
            cod_fee_paise AS "codFeePaise", total_paise AS "totalPaise",
            customer_name AS "customerName", customer_email AS "customerEmail",
            customer_mobile AS "customerMobile", address_line1 AS "addressLine1",
            address_line2 AS "addressLine2", landmark, city, state, pincode,
            admin_notes AS "adminNotes", tracking_url AS "trackingUrl",
            created_at AS "createdAt", updated_at AS "updatedAt"
       FROM orders WHERE id = $1`,
    [id],
  );
  if (!order) return c.json({ error: 'not_found' }, 404);

  const [items, events] = await Promise.all([
    query(
      `SELECT sku, kind, name, unit_price_paise AS "unitPricePaise",
              quantity, line_total_paise AS "lineTotalPaise"
         FROM order_items WHERE order_id = $1 ORDER BY id`,
      [id],
    ),
    query(
      `SELECT from_status AS "fromStatus", to_status AS "toStatus",
              note, actor, created_at AS "createdAt"
         FROM order_events WHERE order_id = $1 ORDER BY created_at`,
      [id],
    ),
  ]);

  return c.json({ ...order, items, events });
});

const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(['unpaid', 'paid', 'refunded', 'failed']).optional(),
  trackingUrl: z.string().trim().url().max(500).nullable().optional(),
  adminNotes: z.string().max(4000).optional(),
  note: z.string().max(500).optional(),
});

admin.patch('/admin/orders/:id', async (c) => {
  const id = c.req.param('id');
  const parsed = updateOrderSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'validation_failed', issues: z.treeifyError(parsed.error) }, 400);
  }

  const existing = await queryOne<{ status: string }>(
    `SELECT status FROM orders WHERE id = $1`,
    [id],
  );
  if (!existing) return c.json({ error: 'not_found' }, 404);

  const { status, paymentStatus, trackingUrl, adminNotes, note } = parsed.data;
  const sets: string[] = [];
  const params: unknown[] = [];

  if (status !== undefined) { params.push(status); sets.push(`status = $${params.length}::order_status`); }
  if (paymentStatus !== undefined) { params.push(paymentStatus); sets.push(`payment_status = $${params.length}::payment_status`); }
  if (trackingUrl !== undefined) { params.push(trackingUrl); sets.push(`tracking_url = $${params.length}`); }
  if (adminNotes !== undefined) { params.push(adminNotes); sets.push(`admin_notes = $${params.length}`); }

  if (sets.length === 0) return c.json({ error: 'nothing_to_update' }, 400);

  sets.push('updated_at = now()');
  params.push(id);
  await query(`UPDATE orders SET ${sets.join(', ')} WHERE id = $${params.length}`, params);

  if (status && status !== existing.status) {
    await query(
      `INSERT INTO order_events (order_id, from_status, to_status, note, actor)
       VALUES ($1, $2::order_status, $3::order_status, $4, $5)`,
      [id, existing.status, status, note ?? '', c.get('admin').email],
    );
  }

  return c.json({ ok: true });
});

/* --------------------------------------------------------------- inventory */

admin.get('/admin/inventory', async (c) => {
  const variants = await query(
    `SELECT v.id AS sku, f.name AS flavour, v.grams, v.stock, v.is_active AS "isActive",
            p.price_paise AS "pricePaise"
       FROM variants v
       JOIN flavours f   ON f.slug  = v.flavour_slug
       JOIN pack_sizes p ON p.grams = v.grams
      WHERE f.is_active
      ORDER BY f.sort_order, v.grams`,
  );
  const comboRows = await query(
    `SELECT slug, name, stock, is_active AS "isActive", price_paise AS "pricePaise"
       FROM combos ORDER BY sort_order`,
  );
  return c.json({ variants, combos: comboRows });
});

const stockSchema = z.object({
  kind: z.enum(['variant', 'combo']),
  id: z.string().trim().min(1).max(120),
  stock: z.number().int().min(0).max(100_000).optional(),
  isActive: z.boolean().optional(),
});

admin.patch('/admin/inventory', async (c) => {
  const parsed = stockSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'validation_failed', issues: z.treeifyError(parsed.error) }, 400);
  }
  const { kind, id, stock, isActive } = parsed.data;
  if (stock === undefined && isActive === undefined) {
    return c.json({ error: 'nothing_to_update' }, 400);
  }

  const table = kind === 'variant' ? 'variants' : 'combos';
  const idColumn = kind === 'variant' ? 'id' : 'slug';
  const sets: string[] = [];
  const params: unknown[] = [];

  if (stock !== undefined) { params.push(stock); sets.push(`stock = $${params.length}`); }
  if (isActive !== undefined) { params.push(isActive); sets.push(`is_active = $${params.length}`); }
  params.push(id);

  const rows = await query(
    `UPDATE ${table} SET ${sets.join(', ')} WHERE ${idColumn} = $${params.length} RETURNING ${idColumn}`,
    params,
  );
  if (rows.length === 0) return c.json({ error: 'not_found' }, 404);
  return c.json({ ok: true });
});

/* ---------------------------------------------------------------- settings */

admin.get('/admin/settings', async (c) => {
  const rows = await query<{ key: string; value: unknown }>(`SELECT key, value FROM settings`);
  return c.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
});

admin.put('/admin/settings/commerce', async (c) => {
  const parsed = z
    .object({
      freeShippingThresholdInPaise: z.number().int().min(0).max(10_000_00),
      flatShippingInPaise: z.number().int().min(0).max(1_000_00),
      codFeeInPaise: z.number().int().min(0).max(1_000_00),
      maxQuantityPerLine: z.number().int().min(1).max(100),
    })
    .safeParse(await c.req.json().catch(() => null));

  if (!parsed.success) {
    return c.json({ error: 'validation_failed', issues: z.treeifyError(parsed.error) }, 400);
  }

  await query(
    `INSERT INTO settings (key, value, updated_at) VALUES ('commerce', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [JSON.stringify(parsed.data)],
  );
  return c.json({ ok: true });
});
