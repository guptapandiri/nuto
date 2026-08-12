import {
  createHash,
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import { query, queryOne } from './db.ts';

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SESSION_DAYS = 7;

/**
 * scrypt from node:crypto rather than bcrypt/argon2 — no native dependency to
 * compile, and it is a memory-hard KDF, which is what matters here.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  // Constant-time compare so a timing signal cannot leak the hash.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  mobile: string;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Returns the raw token for the cookie. Only its SHA-256 reaches the database,
 * so a dump of admin_sessions cannot be replayed as a live session.
 */
export async function createSession(adminId: string, userAgent: string): Promise<string> {
  const token = `${randomUUID()}.${randomBytes(32).toString('base64url')}`;
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO admin_sessions (token_hash, admin_id, expires_at, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [hashToken(token), adminId, expires, userAgent.slice(0, 400)],
  );
  return token;
}

export async function resolveSession(token: string): Promise<AdminUser | undefined> {
  return queryOne<AdminUser>(
    `SELECT u.id, u.email, u.name
       FROM admin_sessions s
       JOIN admin_users u ON u.id = s.admin_id
      WHERE s.token_hash = $1
        AND s.expires_at > now()
        AND u.is_active`,
    [hashToken(token)],
  );
}

export async function destroySession(token: string): Promise<void> {
  await query(`DELETE FROM admin_sessions WHERE token_hash = $1`, [hashToken(token)]);
}

export async function createCustomerSession(
  customerId: string,
  userAgent: string,
): Promise<string> {
  const token = `${randomUUID()}.${randomBytes(32).toString('base64url')}`;
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await query(
    `INSERT INTO customer_sessions (token_hash, customer_id, expires_at, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [hashToken(token), customerId, expires, userAgent.slice(0, 400)],
  );
  return token;
}

export async function resolveCustomerSession(token: string): Promise<CustomerUser | undefined> {
  return queryOne<CustomerUser>(
    `SELECT u.id, u.email, u.name, u.mobile
       FROM customer_sessions s
       JOIN customer_users u ON u.id = s.customer_id
      WHERE s.token_hash = $1
        AND s.expires_at > now()
        AND u.is_active`,
    [hashToken(token)],
  );
}

export async function destroyCustomerSession(token: string): Promise<void> {
  await query(`DELETE FROM customer_sessions WHERE token_hash = $1`, [hashToken(token)]);
}

/** Housekeeping — called on boot and hourly. */
export async function purgeExpiredSessions(): Promise<number> {
  const adminRows = await query(`DELETE FROM admin_sessions WHERE expires_at < now() RETURNING 1`);
  const customerRows = await query(
    `DELETE FROM customer_sessions WHERE expires_at < now() RETURNING 1`,
  );
  return adminRows.length + customerRows.length;
}

export const SESSION_COOKIE = 'nuto_admin';
export const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;
export const CUSTOMER_SESSION_COOKIE = 'nuto_customer';
