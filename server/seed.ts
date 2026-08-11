import { combos } from '../src/data/combos.ts';
import { flavours, packSizes } from '../src/data/range.ts';
import { commerce } from '../src/data/business.ts';
import { hashPassword } from './auth.ts';
import { pool, transaction } from './db.ts';
import { env } from './env.ts';

/**
 * Seeds the catalogue from the files the storefront was built against, so the
 * database becomes the source of truth without anything changing on screen.
 *
 * Upserts throughout — re-running refreshes copy and prices but preserves
 * stock levels and anything the admin has since edited.
 */
async function seed() {
  await transaction(async (client) => {
    for (const [index, size] of packSizes.entries()) {
      await client.query(
        `INSERT INTO pack_sizes (grams, price_paise, sort_order) VALUES ($1,$2,$3)
         ON CONFLICT (grams) DO UPDATE SET price_paise = EXCLUDED.price_paise,
                                           sort_order  = EXCLUDED.sort_order`,
        [size.grams, size.priceInPaise, index],
      );
    }
    console.log(`pack_sizes: ${packSizes.length}`);

    for (const [index, flavour] of flavours.entries()) {
      await client.query(
        `INSERT INTO flavours (slug, name, note, blurb, accent, heat, image, rating, review_count, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name, note = EXCLUDED.note, blurb = EXCLUDED.blurb,
           accent = EXCLUDED.accent, heat = EXCLUDED.heat, image = EXCLUDED.image,
           rating = EXCLUDED.rating, review_count = EXCLUDED.review_count,
           sort_order = EXCLUDED.sort_order`,
        [
          flavour.slug, flavour.name, flavour.note, flavour.blurb, flavour.accent,
          flavour.heat, flavour.image, flavour.rating, flavour.reviewCount, index,
        ],
      );

      for (const size of packSizes) {
        await client.query(
          `INSERT INTO variants (id, flavour_slug, grams, stock)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (id) DO NOTHING`,
          [`${flavour.slug}-${size.grams}`, flavour.slug, size.grams, 100],
        );
      }
    }
    console.log(`flavours: ${flavours.length} (${flavours.length * packSizes.length} variants)`);

    // Keep retired products in the database for historical orders, but ensure
    // they are no longer exposed by the catalogue, checkout, or inventory UI.
    const activeSlugs = flavours.map((flavour) => flavour.slug);
    await client.query(
      `UPDATE flavours SET is_active = false WHERE NOT (slug = ANY($1::text[]))`,
      [activeSlugs],
    );
    await client.query(
      `UPDATE variants SET is_active = false
        WHERE flavour_slug NOT IN (SELECT slug FROM flavours WHERE is_active)`,
    );

    for (const [index, combo] of combos.entries()) {
      await client.query(
        `INSERT INTO combos (slug, name, tagline, description, price_paise, image, badge, stock, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name, tagline = EXCLUDED.tagline,
           description = EXCLUDED.description, price_paise = EXCLUDED.price_paise,
           image = EXCLUDED.image, badge = EXCLUDED.badge, sort_order = EXCLUDED.sort_order`,
        [
          combo.slug, combo.name, combo.tagline, combo.description,
          combo.priceInPaise, combo.image, combo.badge ?? null, 50, index,
        ],
      );

      await client.query(`DELETE FROM combo_items WHERE combo_slug = $1`, [combo.slug]);
      for (const item of combo.items) {
        await client.query(
          `INSERT INTO combo_items (combo_slug, flavour_slug, grams, quantity)
           VALUES ($1,$2,$3,$4)
           ON CONFLICT (combo_slug, flavour_slug, grams)
           DO UPDATE SET quantity = combo_items.quantity + EXCLUDED.quantity`,
          [combo.slug, item.flavourSlug, item.grams, item.quantity],
        );
      }
    }
    console.log(`combos: ${combos.length}`);

    // Commerce rules live in the DB so the admin can change them without a deploy.
    await client.query(
      `INSERT INTO settings (key, value) VALUES ('commerce', $1)
       ON CONFLICT (key) DO NOTHING`,
      [
        JSON.stringify({
          freeShippingThresholdInPaise: commerce.freeShippingThresholdInPaise,
          flatShippingInPaise: commerce.flatShippingInPaise,
          codFeeInPaise: commerce.codFeeInPaise,
          maxQuantityPerLine: commerce.maxQuantityPerLine,
        }),
      ],
    );

    if (env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
      const hash = await hashPassword(env.ADMIN_PASSWORD);
      const { rowCount } = await client.query(
        `INSERT INTO admin_users (email, name, password_hash) VALUES ($1,$2,$3)
         ON CONFLICT (lower(email)) DO NOTHING`,
        [env.ADMIN_EMAIL, 'Nuto Admin', hash],
      );
      console.log(
        rowCount
          ? `admin user created: ${env.ADMIN_EMAIL}`
          : `admin user already exists: ${env.ADMIN_EMAIL}`,
      );
    } else {
      console.log('admin user skipped — set ADMIN_EMAIL and ADMIN_PASSWORD to create one');
    }
  });

  await pool.end();
  console.log('Seed complete.');
}

seed().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
