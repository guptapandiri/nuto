import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { purgeExpiredSessions } from './auth.ts';
import { pool } from './db.ts';
import { allowedOrigins, env, isProduction } from './env.ts';
import { admin } from './routes/admin.ts';
import { account } from './routes/account.ts';
import { catalog } from './routes/catalog.ts';
import { orders } from './routes/orders.ts';

const app = new Hono();

app.use('*', secureHeaders());

app.use(
  '/api/*',
  cors({
    // In production only the configured origins may send credentialed requests.
    origin: (origin) => {
      if (!isProduction) return origin ?? '*';
      return allowedOrigins.includes(origin) ? origin : null;
    },
    credentials: true,
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

// Coarse rate limit. Enough to blunt scripted abuse; a CDN or proxy should do
// the real work in front of this.
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 120;

app.use('/api/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  const now = Date.now();
  const record = hits.get(ip);

  if (!record || record.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  } else if (++record.count > MAX_PER_WINDOW) {
    return c.json({ error: 'rate_limited' }, 429);
  }

  if (hits.size > 10_000) {
    for (const [key, value] of hits) if (value.resetAt < now) hits.delete(key);
  }
  await next();
});

app.get('/api/health', async (c) => {
  try {
    await pool.query('SELECT 1');
    return c.json({ ok: true, env: env.NODE_ENV });
  } catch {
    return c.json({ ok: false, error: 'database_unreachable' }, 503);
  }
});

app.route('/api', catalog);
app.route('/api', orders);
app.route('/api', admin);
app.route('/api', account);

app.onError((error, c) => {
  console.error('[api] unhandled:', error);
  // Never leak internals to the client.
  return c.json({ error: 'server_error' }, 500);
});

// In production this process also serves the built SPA, so there is one thing
// to deploy. Unknown non-API paths fall through to index.html for the router.
if (isProduction && process.env.API_ONLY !== 'true') {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('/*', serveStatic({ path: './dist/index.html' }));
}

const server = serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`[api] listening on http://localhost:${info.port} (${env.NODE_ENV})`);
});

async function purgeSessionsSafely() {
  try {
    const n = await purgeExpiredSessions();
    if (n) console.log(`[auth] purged ${n} expired sessions`);
  } catch (error) {
    // A temporarily unavailable database must not terminate the API process.
    // `/api/health` continues to report 503 until it recovers.
    console.error('[auth] session purge failed:', error);
  }
}

void purgeSessionsSafely();
const purgeTimer = setInterval(() => void purgeSessionsSafely(), 60 * 60 * 1000);

async function shutdown(signal: string) {
  console.log(`\n[api] ${signal} — shutting down`);
  clearInterval(purgeTimer);
  server.close();
  await pool.end();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
