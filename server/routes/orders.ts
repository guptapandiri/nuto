import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { z } from 'zod';
import { queryOne, transaction } from '../db.ts';
import {
  calculateTotals,
  generateReference,
  getCommerceSettings,
  priceLines,
} from '../lib/pricing.ts';
import { resolveCoupon } from '../../src/lib/coupon.ts';
import { CUSTOMER_SESSION_COOKIE, resolveCustomerSession } from '../auth.ts';

export const orders = new Hono();

/** Mirrors the client-side validators — the client's checks are UX, these are the rules. */
const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  mobile: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((digits) => /^(91)?[6-9]\d{9}$/.test(digits), 'Invalid Indian mobile number')
    .transform((digits) => (digits.length === 12 ? digits.slice(2) : digits)),
  addressLine1: z.string().trim().min(4).max(200),
  addressLine2: z.string().trim().min(3).max(200),
  landmark: z.string().trim().max(200).default(''),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^[1-8]\d{5}$/, 'Invalid PIN code'),
});

const createOrderSchema = z.object({
  lines: z
    .array(
      z.object({
        sku: z.string().trim().min(1).max(120),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .min(1, 'Cart is empty')
    .max(40),
  paymentMethod: z.enum(['prepaid', 'cod']),
  couponCode: z.string().trim().max(40).optional(),
  address: addressSchema,
});

orders.post('/orders', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'validation_failed', issues: z.treeifyError(parsed.error) },
      400,
    );
  }

  const { lines, paymentMethod, address, couponCode } = parsed.data;
  const sessionToken = getCookie(c, CUSTOMER_SESSION_COOKIE);
  const customer = sessionToken ? await resolveCustomerSession(sessionToken) : undefined;

  try {
    const order = await transaction(async (client) => {
      const settings = await getCommerceSettings(client);
      const { priced, unknown } = await priceLines(lines, client);

      if (unknown.length > 0) {
        throw Object.assign(new Error('Unknown items in cart'), {
          status: 400,
          payload: { error: 'unknown_skus', skus: unknown },
        });
      }

      const overQuantity = priced.filter(
        (line) => line.quantity > settings.maxQuantityPerLine,
      );
      if (overQuantity.length > 0) {
        throw Object.assign(new Error('Quantity limit exceeded'), {
          status: 400,
          payload: {
            error: 'quantity_limit',
            max: settings.maxQuantityPerLine,
            skus: overQuantity.map((line) => line.sku),
          },
        });
      }

      const outOfStock = priced.filter((line) => line.quantity > line.stock);
      if (outOfStock.length > 0) {
        throw Object.assign(new Error('Out of stock'), {
          status: 409,
          payload: {
            error: 'out_of_stock',
            items: outOfStock.map((line) => ({
              sku: line.sku,
              name: line.name,
              available: line.stock,
            })),
          },
        });
      }

      const coupon = resolveCoupon(couponCode, paymentMethod, priced.reduce((sum, line) => sum + line.lineTotalPaise, 0));
      if (coupon.error) {
        throw Object.assign(new Error(coupon.error), {
          status: 400,
          payload: { error: 'invalid_coupon', message: coupon.error },
        });
      }
      const totals = calculateTotals(priced, paymentMethod, settings, couponCode);

      const created = await queryOne<{ id: string; reference: string; created_at: string }>(
        `INSERT INTO orders (
           reference, payment_method, subtotal_paise, discount_paise, shipping_paise, cod_fee_paise,
           total_paise, customer_name, customer_email, customer_mobile,
           address_line1, address_line2, landmark, city, state, pincode, customer_id
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         RETURNING id, reference, created_at`,
        [
          generateReference(), paymentMethod,
          totals.subtotalPaise, totals.discountPaise, totals.shippingPaise, totals.codFeePaise, totals.totalPaise,
          address.fullName, address.email, address.mobile,
          address.addressLine1, address.addressLine2, address.landmark,
          address.city, address.state, address.pincode, customer?.id ?? null,
        ],
        client,
      );
      if (!created) throw new Error('Order insert returned no row');

      for (const line of priced) {
        await client.query(
          `INSERT INTO order_items
             (order_id, sku, kind, name, unit_price_paise, quantity, line_total_paise)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [created.id, line.sku, line.kind, line.name, line.unitPricePaise, line.quantity, line.lineTotalPaise],
        );

        // Decrement stock inside the same transaction, guarded so concurrent
        // orders cannot drive it negative.
        const table = line.kind === 'variant' ? 'variants' : 'combos';
        const idColumn = line.kind === 'variant' ? 'id' : 'slug';
        const key = line.kind === 'variant' ? line.sku : line.sku.replace(/^combo-/, '');

        const { rowCount } = await client.query(
          `UPDATE ${table} SET stock = stock - $1 WHERE ${idColumn} = $2 AND stock >= $1`,
          [line.quantity, key],
        );
        if (rowCount === 0) {
          throw Object.assign(new Error('Stock changed during checkout'), {
            status: 409,
            payload: { error: 'out_of_stock', items: [{ sku: line.sku, name: line.name }] },
          });
        }
      }

      await client.query(
        `INSERT INTO order_events (order_id, to_status, note, actor)
         VALUES ($1, 'pending', 'Order placed', 'customer')`,
        [created.id],
      );

      return { created, priced, totals };
    });

    return c.json(
      {
        reference: order.created.reference,
        placedAt: order.created.created_at,
        totals: order.totals,
        lines: order.priced.map(({ stock: _stock, ...line }) => line),
      },
      201,
    );
  } catch (error) {
    const err = error as { status?: number; payload?: unknown };
    if (err.status && err.payload) {
      return c.json(err.payload as Record<string, unknown>, err.status as 400);
    }
    console.error('[orders] create failed:', error);
    return c.json({ error: 'server_error' }, 500);
  }
});

/** Customer-facing lookup by reference — no auth, but requires the exact reference. */
orders.get('/orders/:reference', async (c) => {
  const reference = c.req.param('reference').toUpperCase();
  if (!/^NUTO-[A-Z0-9]{6}$/.test(reference)) {
    return c.json({ error: 'not_found' }, 404);
  }

  const order = await queryOne(
    `SELECT reference, status, payment_method AS "paymentMethod",
            payment_status AS "paymentStatus", total_paise AS "totalPaise",
            created_at AS "createdAt", tracking_url AS "trackingUrl"
       FROM orders WHERE reference = $1`,
    [reference],
  );
  if (!order) return c.json({ error: 'not_found' }, 404);
  return c.json(order);
});
