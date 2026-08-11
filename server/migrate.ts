import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './db.ts';

/** Applies schema.sql. It is written to be idempotent, so re-running is safe. */
async function migrate() {
  const path = fileURLToPath(new URL('./schema.sql', import.meta.url));
  const sql = await readFile(path, 'utf8');

  console.log('Applying schema…');
  await pool.query(sql);

  const { rows } = await pool.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY 1`,
  );
  console.log(`Done. ${rows.length} tables:`, rows.map((r) => r.tablename).join(', '));
  await pool.end();
}

migrate().catch((error: unknown) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
