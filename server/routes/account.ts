import { Hono } from 'hono';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import { z } from 'zod';
import {
  createCustomerSession,
  CUSTOMER_SESSION_COOKIE,
  destroyCustomerSession,
  hashPassword,
  resolveCustomerSession,
  SESSION_MAX_AGE,
  verifyPassword,
  type CustomerUser,
} from '../auth.ts';
import { query, queryOne } from '../db.ts';
import { isProduction } from '../env.ts';

type Vars = { Variables: { customer: CustomerUser } };
export const account = new Hono<Vars>();

const credentialsSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  mobile: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((digits) => /^(91)?[6-9]\d{9}$/.test(digits), 'Invalid Indian mobile number')
    .transform((digits) => (digits.length === 12 ? digits.slice(2) : digits)),
});

const registerSchema = credentialsSchema.extend(profileSchema.shape);

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

function setSessionCookie(c: Parameters<typeof setCookie>[0], token: string) {
  setCookie(c, CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

account.post('/account/register', async (c) => {
  const parsed = registerSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'validation_failed', issues: z.treeifyError(parsed.error) }, 400);
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await queryOne<CustomerUser>(
    `INSERT INTO customer_users (email, password_hash, name, mobile)
     VALUES (lower($1), $2, $3, $4)
     ON CONFLICT (lower(email)) DO NOTHING
     RETURNING id, email, name, mobile`,
    [parsed.data.email, passwordHash, parsed.data.name, parsed.data.mobile],
  );
  if (!user) return c.json({ error: 'account_exists' }, 409);

  const token = await createCustomerSession(user.id, c.req.header('user-agent') ?? '');
  setSessionCookie(c, token);
  return c.json(user, 201);
});

account.post('/account/login', async (c) => {
  const parsed = credentialsSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: 'invalid_credentials' }, 401);

  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const key = `${parsed.data.email.toLowerCase()}|${ip}`;
  const record = attempts.get(key);
  if (record && record.until > Date.now() && record.count >= MAX_ATTEMPTS) {
    return c.json({ error: 'too_many_attempts' }, 429);
  }

  const user = await queryOne<CustomerUser & { password_hash: string }>(
    `SELECT id, email, name, mobile, password_hash
       FROM customer_users
      WHERE lower(email) = lower($1) AND is_active`,
    [parsed.data.email],
  );
  const valid = user ? await verifyPassword(parsed.data.password, user.password_hash) : false;
  if (!user || !valid) {
    const next = record && record.until > Date.now() ? record.count + 1 : 1;
    attempts.set(key, { count: next, until: Date.now() + LOCKOUT_MS });
    return c.json({ error: 'invalid_credentials' }, 401);
  }

  attempts.delete(key);
  const token = await createCustomerSession(user.id, c.req.header('user-agent') ?? '');
  await query(`UPDATE customer_users SET last_login_at = now() WHERE id = $1`, [user.id]);
  setSessionCookie(c, token);
  return c.json({ id: user.id, email: user.email, name: user.name, mobile: user.mobile });
});

account.use('/account/*', async (c, next) => {
  if (c.req.path.endsWith('/account/login') || c.req.path.endsWith('/account/register')) {
    return next();
  }

  const token = getCookie(c, CUSTOMER_SESSION_COOKIE);
  const customer = token ? await resolveCustomerSession(token) : undefined;
  if (!customer) return c.json({ error: 'unauthorised' }, 401);
  c.set('customer', customer);
  await next();
});

account.get('/account/me', (c) => c.json(c.get('customer')));

account.patch('/account/me', async (c) => {
  const parsed = profileSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: 'validation_failed', issues: z.treeifyError(parsed.error) }, 400);
  }

  const current = c.get('customer');
  const user = await queryOne<CustomerUser>(
    `UPDATE customer_users
        SET name = $1, mobile = $2, updated_at = now()
      WHERE id = $3
      RETURNING id, email, name, mobile`,
    [parsed.data.name, parsed.data.mobile, current.id],
  );
  return user ? c.json(user) : c.json({ error: 'not_found' }, 404);
});

account.post('/account/logout', async (c) => {
  const token = getCookie(c, CUSTOMER_SESSION_COOKIE);
  if (token) await destroyCustomerSession(token);
  deleteCookie(c, CUSTOMER_SESSION_COOKIE, { path: '/' });
  return c.json({ ok: true });
});
