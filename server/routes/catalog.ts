import { Hono } from 'hono';
import { query } from '../db.ts';
import { getCommerceSettings } from '../lib/pricing.ts';

export const catalog = new Hono();

catalog.get('/promotions', async (c) => {
  const promotions = await query(
    `SELECT id, kind, title, message, cta_label AS "ctaLabel", cta_url AS "ctaUrl",
            starts_at AS "startsAt", ends_at AS "endsAt"
       FROM promotions
      WHERE is_active
        AND starts_at <= now()
        AND (ends_at IS NULL OR ends_at > now())
      ORDER BY starts_at DESC
      LIMIT 10`,
  );
  return c.json({ promotions });
});

/** Public catalogue. Only active, in-stock-capable rows are exposed. */
catalog.get('/catalog', async (c) => {
  const [flavours, sizes, combos, comboItems, settings] = await Promise.all([
    query(
      `SELECT f.slug, f.name, f.note, f.blurb, f.accent, f.heat, f.image,
              f.rating::float8 AS rating, f.review_count AS "reviewCount",
              COALESCE(
                json_agg(
                  json_build_object('grams', v.grams, 'stock', v.stock)
                  ORDER BY v.grams
                ) FILTER (WHERE v.id IS NOT NULL),
                '[]'
              ) AS variants
         FROM flavours f
         LEFT JOIN variants v ON v.flavour_slug = f.slug AND v.is_active
        WHERE f.is_active
        GROUP BY f.slug
        ORDER BY f.sort_order, f.slug`,
    ),
    query(`SELECT grams, price_paise AS "priceInPaise" FROM pack_sizes ORDER BY sort_order, grams`),
    query(
      `SELECT slug, name, tagline, description, price_paise AS "priceInPaise",
              image, badge, stock
         FROM combos WHERE is_active ORDER BY sort_order, slug`,
    ),
    query(
      `SELECT combo_slug AS "comboSlug", flavour_slug AS "flavourSlug", grams, quantity
         FROM combo_items ORDER BY combo_slug`,
    ),
    getCommerceSettings(),
  ]);

  const itemsByCombo = new Map<string, unknown[]>();
  for (const item of comboItems as { comboSlug: string }[]) {
    const list = itemsByCombo.get(item.comboSlug) ?? [];
    list.push(item);
    itemsByCombo.set(item.comboSlug, list);
  }

  return c.json({
    flavours,
    packSizes: sizes,
    combos: (combos as { slug: string }[]).map((combo) => ({
      ...combo,
      items: itemsByCombo.get(combo.slug) ?? [],
    })),
    commerce: settings,
  });
});
