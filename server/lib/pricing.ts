import { query, queryOne, type Sql } from '../db.ts';
import { resolveCoupon } from '../../src/lib/coupon.ts';

/**
 * Server-side pricing.
 *
 * The client sends only SKUs and quantities. Every price, every total and every
 * fee is looked up and recomputed here. A client that posts its own prices is
 * ignored — otherwise anyone could buy a Party Pack for ₹1.
 */

export interface CommerceSettings {
  freeShippingThresholdInPaise: number;
  flatShippingInPaise: number;
  codFeeInPaise: number;
  maxQuantityPerLine: number;
}

const FALLBACK: CommerceSettings = {
  freeShippingThresholdInPaise: 49900,
  flatShippingInPaise: 6900,
  codFeeInPaise: 3900,
  maxQuantityPerLine: 99,
};

export async function getCommerceSettings(client?: Sql): Promise<CommerceSettings> {
  const row = await queryOne<{ value: CommerceSettings }>(
    `SELECT value FROM settings WHERE key = 'commerce'`,
    [],
    client,
  );
  return { ...FALLBACK, ...(row?.value ?? {}) };
}

export interface RequestedLine {
  sku: string;
  quantity: number;
}

export interface PricedLine {
  sku: string;
  kind: 'variant' | 'combo';
  name: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
  /** Remaining stock, for the caller to check against. */
  stock: number;
}

interface PriceRow {
  sku: string;
  kind: 'variant' | 'combo';
  name: string;
  unit_price_paise: number;
  stock: number;
}

/**
 * Resolves SKUs to authoritative prices in one round trip. Variants and combos
 * are unioned so the caller does not care which kind a line is.
 */
export async function priceLines(
  lines: RequestedLine[],
  client?: Sql,
): Promise<{ priced: PricedLine[]; unknown: string[] }> {
  if (lines.length === 0) return { priced: [], unknown: [] };

  const skus = lines.map((line) => line.sku);

  const rows = await query<PriceRow>(
    `SELECT v.id AS sku,
            'variant'::text AS kind,
            f.name || ' · ' || v.grams || 'g' AS name,
            p.price_paise AS unit_price_paise,
            v.stock
       FROM variants v
       JOIN flavours f   ON f.slug  = v.flavour_slug
       JOIN pack_sizes p ON p.grams = v.grams
      WHERE v.id = ANY($1) AND v.is_active AND f.is_active
      UNION ALL
     SELECT 'combo-' || c.slug AS sku,
            'combo'::text AS kind,
            c.name,
            c.price_paise AS unit_price_paise,
            c.stock
       FROM combos c
      WHERE 'combo-' || c.slug = ANY($1) AND c.is_active`,
    [skus],
    client,
  );

  const bySku = new Map(rows.map((row) => [row.sku, row]));
  const priced: PricedLine[] = [];
  const unknown: string[] = [];

  for (const line of lines) {
    const row = bySku.get(line.sku);
    if (!row) {
      unknown.push(line.sku);
      continue;
    }
    priced.push({
      sku: row.sku,
      kind: row.kind,
      name: row.name,
      unitPricePaise: row.unit_price_paise,
      quantity: line.quantity,
      lineTotalPaise: row.unit_price_paise * line.quantity,
      stock: row.stock,
    });
  }

  return { priced, unknown };
}

export interface Totals {
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  codFeePaise: number;
  totalPaise: number;
}

export function calculateTotals(
  priced: PricedLine[],
  paymentMethod: 'prepaid' | 'cod',
  settings: CommerceSettings,
  couponCode?: string,
): Totals {
  const subtotalPaise = priced.reduce((sum, line) => sum + line.lineTotalPaise, 0);
  const coupon = resolveCoupon(couponCode, paymentMethod, subtotalPaise);

  const shippingPaise =
    subtotalPaise === 0 || subtotalPaise >= settings.freeShippingThresholdInPaise
      ? 0
      : settings.flatShippingInPaise;

  const codFeePaise =
    paymentMethod === 'cod' && subtotalPaise > 0 ? settings.codFeeInPaise : 0;

  return {
    subtotalPaise,
    discountPaise: coupon.discountInPaise,
    shippingPaise,
    codFeePaise,
    totalPaise: subtotalPaise - coupon.discountInPaise + shippingPaise + codFeePaise,
  };
}

/** NUTO-8F3K2Q — short enough to read over the phone, no ambiguous glyphs. */
export function generateReference(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const byte of bytes) suffix += alphabet[byte % alphabet.length];
  return `NUTO-${suffix}`;
}
