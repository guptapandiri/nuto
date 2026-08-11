# Deployment

The app is two things in one repo:

- a **Vite SPA** (`src/`) built to static files in `dist/`
- a **Hono API** (`server/`) on Node, talking to Postgres

In production the API process also serves `dist/`, so there is a single service to deploy and no cross-origin cookie problems.

---

## Before anything else

**Rotate the database credential.** The connection string used during development has been shared in plaintext and must be considered compromised. In Neon: *Project → Roles → Reset password*, then update `DATABASE_URL` wherever it is set.

**Change the admin password.** The seed created `admin@nuto.in` with whatever `ADMIN_PASSWORD` was in `.env`. Sign in, or re-seed with a long random password, before the site is public.

---

## Environment

Set these on the host. See `.env.example` for the full shape.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Prefer `sslmode=verify-full` |
| `NODE_ENV` | yes | Must be `production` |
| `PORT` | no | Defaults to 8787; most hosts inject their own |
| `ALLOWED_ORIGINS` | **yes in production** | Comma-separated. The API rejects credentialed requests from anywhere else |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | only to seed | Remove once the admin user exists |

The server validates these at boot and exits with a readable message if any are wrong, rather than failing later at the first query.

---

## First deploy

```bash
pnpm install --frozen-lockfile
pnpm db:migrate        # idempotent — safe to re-run on every deploy
pnpm db:seed           # catalogue + first admin; upserts, so also re-runnable
pnpm build             # typecheck + Vite build to dist/
NODE_ENV=production pnpm start
```

`pnpm db:migrate` applies `server/schema.sql`, which is written to be idempotent (`CREATE TABLE IF NOT EXISTS`, guarded enum creation). Running it on every deploy is fine and is the simplest safe default.

### Health check

`GET /api/health` returns `200 {"ok":true}` when the database is reachable and `503` when it is not. Point the platform's health check at it.

### Graceful shutdown

`SIGTERM` and `SIGINT` stop the listener and drain the connection pool before exiting, so rolling deploys do not sever in-flight requests.

---

## Platform notes

### Google Cloud Run

This repository includes a `Dockerfile` and `scripts/deploy-cloud-run.sh` for
an **API-only** Cloud Run service. Host the Vite `dist/` directory on Netlify.

1. Store the production database URL in Secret Manager (this never writes the
   value to source control):

   ```bash
   gcloud config set project nuto-cashews
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
     artifactregistry.googleapis.com secretmanager.googleapis.com
   printf '%s' 'postgresql://…' | gcloud secrets create nuto-database-url \
     --data-file=- --replication-policy=automatic
   ```

2. Allow Cloud Run's runtime service account to read the secret, then deploy.
   Set `FRONTEND_ORIGIN` to the Netlify production URL (no trailing slash):

   ```bash
   PROJECT_NUMBER="$(gcloud projects describe nuto-cashews --format='value(projectNumber)')"
   gcloud secrets add-iam-policy-binding nuto-database-url \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   FRONTEND_ORIGIN=https://your-site.netlify.app ./scripts/deploy-cloud-run.sh
   ```

The script deploys `nuto-storefront` in `asia-south1`, exposes it publicly,
sets `DATABASE_URL` from Secret Manager and `ALLOWED_ORIGINS` from
`FRONTEND_ORIGIN`, and prints its API URL. In Netlify, add a build environment
variable named `VITE_API_URL` with that exact URL, then redeploy the frontend.
To update the CORS allowlist later (the origin has no trailing slash):

```bash
gcloud run services update nuto-storefront --project nuto-cashews \
  --region asia-south1 --update-env-vars \
  'ALLOWED_ORIGINS=https://your-site.netlify.app'
```

Admin authentication is cross-origin in this setup; the API sets its session
cookie with `SameSite=None; Secure`. Some browsers block third-party cookies,
so use custom domains under the same registrable domain (for example
`www.nuto.in` on Netlify and `api.nuto.in` on Cloud Run) for reliable admin
sessions.

Run `pnpm db:migrate` and `pnpm db:seed` once against the production database
before accepting orders. Use a machine with `DATABASE_URL`, `ADMIN_EMAIL`, and
`ADMIN_PASSWORD` set locally; do not add admin credentials to Cloud Run.

**Fly.io / Railway / Render** — a plain Node service. Build with `pnpm install && pnpm build`, start with `pnpm start`, health check `/api/health`. This is the path of least resistance.

**Vercel / Netlify** — these want serverless functions rather than a long-lived Node process. `server/index.ts` would need splitting into per-route handlers, and the in-memory rate limiter and login throttle would need moving to the database, since each invocation gets its own memory. Workable, but it is real work — not a drop-in.

**Split hosting** (static SPA on a CDN, API elsewhere) also works. Then you *must* set `ALLOWED_ORIGINS` to the SPA's origin, and the session cookie needs `SameSite=None; Secure`, which means changing `sameSite` in `server/routes/admin.ts`. Same-origin is simpler; prefer it.

---

## What is enforced server-side

Worth knowing, because none of it can be bypassed from the browser:

- **Prices.** The client posts only SKUs and quantities. Every price, fee and total is recomputed from the database in `server/lib/pricing.ts`. A tampered cart changes nothing.
- **Stock.** Decremented inside the order transaction with a `stock >= quantity` guard, so two simultaneous orders cannot oversell the last jar. The whole order rolls back if any line fails.
- **Address validation.** Re-validated with Zod on the server; the client-side checks are UX only.
- **Admin auth.** scrypt password hashes, session tokens stored only as SHA-256, httpOnly cookies, 7-day expiry, hourly purge of expired rows.
- **Login throttling.** 8 failed attempts per email+IP, then a 15-minute lockout. Identical response whether the user exists or the password is wrong.
- **Rate limiting.** 120 requests/minute per IP across `/api/*`. Coarse — put a CDN or WAF in front for anything serious.
- **Error masking.** `onError` returns `{"error":"server_error"}` and logs the detail server-side. Stack traces never reach the client.

---

## Still missing before taking money

1. **A payment gateway.** Orders are stored with `payment_status = 'unpaid'`. `src/lib/payment.ts` documents the Razorpay integration. The rule that matters: the key secret must never reach the bundle, and a client-side success callback is not proof of payment — verify the signature server-side.
2. **Transactional email/SMS.** The confirmation page says an email was sent. Nothing sends one. Either wire up a provider or change that copy.
3. **Real product data.** Prices, ingredients, allergens, FSSAI licence number and registered address are still placeholders. See `NUTO.md` §5.
4. **Backups.** Neon has point-in-time restore on paid plans. Turn it on before real orders exist.
5. **A second admin user.** There is currently one. There is no password-reset flow, so if that password is lost, the only recovery is a direct database update.
