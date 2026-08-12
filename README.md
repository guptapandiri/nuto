# Nuto storefront

D2C storefront for [Nuto](https://www.instagram.com/nutoproducts/), a Hyderabad flavoured-cashew brand, built for an Indian audience.

**Full stack.** A Vite SPA plus a Hono API on Node, backed by Postgres. Orders are really placed, really priced server-side and really stored; an admin dashboard at `/admin` manages them. The one missing piece is a payment gateway — orders are recorded `unpaid`. See **[DEPLOYMENT.md](./DEPLOYMENT.md)**.

The front door (`/`) is the commerce storefront, built on the proposed range of 8 flavours × 3 pack sizes, plus 6 combos sold as their own SKUs. The original marketing-led storefront is preserved at `/legacy`, and three rejected design concepts at `/concepts`.

Brand facts, palette, product data and compliance requirements: **[BRAND.md](./BRAND.md)**.

---

## Running it

```bash
pnpm install
cp .env.example .env      # then fill in DATABASE_URL
pnpm db:migrate           # create tables (idempotent)
pnpm db:seed              # catalogue + first admin user
pnpm dev:all              # API on :8787, SPA on :5173
```

| Command | What it does |
| --- | --- |
| `pnpm dev:all` | API and SPA together, prefixed output |
| `pnpm dev` | SPA only (proxies `/api` to :8787) |
| `pnpm dev:api` | API only, with watch/restart |
| `pnpm db:migrate` | Apply `server/schema.sql` |
| `pnpm db:seed` | Upsert catalogue, settings and admin user |
| `pnpm build` | Typecheck, then production build to `dist/` |
| `pnpm start` | Production: API + serves `dist/` |
| `pnpm typecheck` | Types only, no build |

**Secrets never reach the browser.** `DATABASE_URL` is read only by `server/`; nothing under `src/` imports it. The SPA talks to the database exclusively through the API.

`dist/` is static — it deploys to Vercel, Netlify, Cloudflare Pages or S3 as-is. The one requirement is a **SPA rewrite**: every path must serve `index.html`, or refreshing `/p/peri-peri` will 404.

### Tests

No unit-test framework. Two scripts drive a real Chrome over the DevTools Protocol instead, both exiting non-zero on failure so they can gate a deploy.

```bash
pnpm dev:all                  # or dev + dev:api separately
node scripts/e2e-test.mjs     # full stack: order → Postgres → admin
node scripts/smoke-test.mjs   # legacy storefront checkout flow
```

`e2e-test.mjs` places an order through the UI, confirms it landed in Postgres with server-computed totals, signs into the admin, changes the order status, checks the audit trail, and verifies that signing out invalidates the session server-side.

---

## Where to change things

| I want to change… | Edit |
| --- | --- |
| **Flavours, pack sizes, prices (current range)** | `src/data/range.ts` |
| **Combos and value packs** | `src/data/combos.ts` |
| **Old single-size SKUs (`/legacy` only)** | `src/data/products.ts` |
| **FSSAI number, address, phone, email, WhatsApp** | `src/data/business.ts` |
| **Shipping threshold, flat rate, COD fee** | `src/data/business.ts` → `commerce` |
| **Gift boxes** | `src/data/giftBoxes.ts` |
| **Policy copy** | `src/data/policies.ts` |
| **Colours, fonts, spacing tokens** | `src/index.css` (`@theme`) |
| **Product photos** | Replace files in `public/cards/` (grid + PDP) and `public/products/` (legacy) |

Every price is an **integer in paise** — ₹649 is `64900`. Never store money as a float. Display formatting goes through `src/lib/money.ts`, which uses `en-IN` grouping, so ₹1,29,999 renders correctly rather than as ₹129,999.

---

## Structure

```
src/
├─ data/        range (live) · catalogue · products (legacy) · business · policies · states
├─ types/       shared domain types
├─ lib/         money · validation · totals · payment seam · cn
├─ context/     cart context + provider (localStorage-backed)
├─ hooks/       useCart
├─ components/  ui/ · layout/ · product/ · cart/
├─ pages/       one file per route
│  ├─ shop/     the live commerce storefront + flavour and combo pages
│  └─ concepts/ three rejected design directions
scripts/
├─ build-product-images.mjs   derives per-SKU images from Instagram creatives
└─ smoke-test.mjs             end-to-end purchase flow
```

Order arithmetic lives in exactly one place, `src/lib/totals.ts`, so the cart, checkout and confirmation cannot disagree about what you owe.

Combo savings are **derived, never stored** — `partsTotalInPaise()` in `src/data/combos.ts` sums the constituent pack prices from `range.ts`, so a "you save ₹97" claim cannot drift out of sync with the price list.

---

## Built for India specifically

Things a generic storefront template gets wrong, handled here:

- ₹ with `en-IN` lakh/crore grouping throughout.
- Address form matching Indian postal reality: flat/house, area/street, landmark, town/city, **state dropdown (28 states + 8 UTs)**, 6-digit PIN.
- **Mobile validated as 10 digits starting 6–9**, accepting `+91`/`0` prefixes and spaces on input.
- **PIN validated as 6 digits not starting 0** — the first digit is the postal zone, 1–8.
- **Cash on Delivery as a first-class option** with its handling fee shown before you commit.
- FSSAI licence number, green veg mark and net weight displayed as required by law.
- WhatsApp as a support channel.
- 16px form controls, so iOS Safari doesn't zoom the viewport on focus.
- Mobile-first — most traffic will arrive from Instagram on a phone.

---

## Admin

`/admin` — session-gated dashboard: revenue and order metrics, order list with search and status filters, an order drawer for status transitions, tracking URL and internal notes with a full audit trail, live stock editing per SKU, and shipping/COD fee settings that take effect without a deploy.

Auth is scrypt-hashed passwords, httpOnly session cookies, session tokens stored only as SHA-256, and a login throttle. The dashboard is code-split, so shoppers never download it.

---

## Going live

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full checklist. The short version:

1. **Rotate the database credential** — the development one was shared in plaintext.
2. **Change the admin password** from the seed value.
3. **Set `ALLOWED_ORIGINS`** — required in production or the API refuses credentialed requests.
4. **Connect a payment gateway.** Orders currently store `payment_status = 'unpaid'`. `src/lib/payment.ts` documents the Razorpay path.
5. **Confirmed prices and legal details** — MRPs, discounts, ratings, reviews and the registered address are still invented. See `NUTO.md` §5.
