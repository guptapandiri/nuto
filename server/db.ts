import pg from 'pg';
import { env, isProduction } from './env.ts';

/**
 * Neon pools connections at its own proxy, so a small client-side pool is
 * right — a large one just holds idle sockets open.
 */
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: isProduction ? 10 : 4,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on('error', (error) => {
  // An idle client erroring must not take the process down.
  console.error('[db] idle client error:', error.message);
});

export type Sql = pg.Pool | pg.PoolClient;

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  client: Sql = pool,
): Promise<T[]> {
  const result = await client.query<T>(sql, params);
  return result.rows;
}

export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
  client: Sql = pool,
): Promise<T | undefined> {
  const rows = await query<T>(sql, params, client);
  return rows[0];
}

/** Runs `fn` inside a transaction, rolling back on any throw. */
export async function transaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
