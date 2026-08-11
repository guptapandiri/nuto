-- Nuto storefront schema.
-- Idempotent: safe to run repeatedly. Applied by `pnpm db:migrate`.

-- ---------------------------------------------------------------- catalogue

CREATE TABLE IF NOT EXISTS pack_sizes (
  grams        integer PRIMARY KEY,
  price_paise  integer NOT NULL CHECK (price_paise > 0),
  sort_order   integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS flavours (
  slug          text PRIMARY KEY,
  name          text NOT NULL,
  note          text NOT NULL DEFAULT '',
  blurb         text NOT NULL DEFAULT '',
  accent        text NOT NULL DEFAULT '#333333',
  heat          smallint NOT NULL DEFAULT 0 CHECK (heat BETWEEN 0 AND 3),
  image         text NOT NULL DEFAULT '',
  rating        numeric(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count  integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  sort_order    integer NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- One row per buyable flavour × size. `id` matches the cart slug, e.g. chilli-100.
CREATE TABLE IF NOT EXISTS variants (
  id            text PRIMARY KEY,
  flavour_slug  text NOT NULL REFERENCES flavours(slug) ON DELETE CASCADE,
  grams         integer NOT NULL REFERENCES pack_sizes(grams),
  stock         integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active     boolean NOT NULL DEFAULT true,
  UNIQUE (flavour_slug, grams)
);

CREATE TABLE IF NOT EXISTS combos (
  slug         text PRIMARY KEY,
  name         text NOT NULL,
  tagline      text NOT NULL DEFAULT '',
  description  text NOT NULL DEFAULT '',
  price_paise  integer NOT NULL CHECK (price_paise > 0),
  image        text NOT NULL DEFAULT '',
  badge        text,
  stock        integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sort_order   integer NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS combo_items (
  combo_slug    text NOT NULL REFERENCES combos(slug) ON DELETE CASCADE,
  flavour_slug  text NOT NULL REFERENCES flavours(slug),
  grams         integer NOT NULL REFERENCES pack_sizes(grams),
  quantity      integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (combo_slug, flavour_slug, grams)
);

-- ------------------------------------------------------------------- orders

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM
    ('pending','confirmed','packed','shipped','delivered','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('prepaid','cod');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('unpaid','paid','refunded','failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference        text UNIQUE NOT NULL,
  status           order_status NOT NULL DEFAULT 'pending',
  payment_method   payment_method NOT NULL,
  payment_status   payment_status NOT NULL DEFAULT 'unpaid',

  -- All money in integer paise, computed server-side. Never from the client.
  subtotal_paise   integer NOT NULL CHECK (subtotal_paise >= 0),
  discount_paise   integer NOT NULL DEFAULT 0 CHECK (discount_paise >= 0),
  shipping_paise   integer NOT NULL DEFAULT 0 CHECK (shipping_paise >= 0),
  cod_fee_paise    integer NOT NULL DEFAULT 0 CHECK (cod_fee_paise >= 0),
  total_paise      integer NOT NULL CHECK (total_paise >= 0),

  customer_name    text NOT NULL,
  customer_email   text NOT NULL,
  customer_mobile  text NOT NULL,
  address_line1    text NOT NULL,
  address_line2    text NOT NULL,
  landmark         text NOT NULL DEFAULT '',
  city             text NOT NULL,
  state            text NOT NULL,
  pincode          text NOT NULL,

  admin_notes      text NOT NULL DEFAULT '',
  tracking_url     text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_paise integer NOT NULL DEFAULT 0
  CHECK (discount_paise >= 0);

CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx     ON orders (status);

-- Line items snapshot name and price at purchase time, so later catalogue
-- edits never rewrite the history of an order that has already been placed.
CREATE TABLE IF NOT EXISTS order_items (
  id                bigserial PRIMARY KEY,
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku               text NOT NULL,
  kind              text NOT NULL CHECK (kind IN ('variant','combo')),
  name              text NOT NULL,
  unit_price_paise  integer NOT NULL CHECK (unit_price_paise >= 0),
  quantity          integer NOT NULL CHECK (quantity > 0),
  line_total_paise  integer NOT NULL CHECK (line_total_paise >= 0)
);

CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

CREATE TABLE IF NOT EXISTS order_events (
  id          bigserial PRIMARY KEY,
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status order_status,
  to_status   order_status NOT NULL,
  note        text NOT NULL DEFAULT '',
  actor       text NOT NULL DEFAULT 'system',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_events_order_idx ON order_events (order_id, created_at);

-- -------------------------------------------------------------------- admin

CREATE TABLE IF NOT EXISTS admin_users (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email          text NOT NULL,
  password_hash  text NOT NULL,
  name           text NOT NULL DEFAULT 'Admin',
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  last_login_at  timestamptz
);

-- Case-insensitive uniqueness without needing the citext extension.
CREATE UNIQUE INDEX IF NOT EXISTS admin_users_email_key ON admin_users (lower(email));

-- Only the SHA-256 of the session token is stored, so a database leak does not
-- hand over live sessions.
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash  text PRIMARY KEY,
  admin_id    uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  user_agent  text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS admin_sessions_expiry_idx ON admin_sessions (expires_at);

-- ----------------------------------------------------------------- settings

CREATE TABLE IF NOT EXISTS settings (
  key         text PRIMARY KEY,
  value       jsonb NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
