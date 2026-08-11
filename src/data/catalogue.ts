import { combos, totalGrams } from './combos';
import { getProduct } from './products';
import { flavours, packSizes } from './range';

/**
 * One lookup covering everything that can go in a cart.
 *
 * The live storefront sells single-size jars from products.ts. The new range is
 * flavour × pack size, so each combination is its own line item with a
 * composite slug — `chilli-100`. Both resolve through here so the cart, the
 * drawer and the totals do not need to know which range an item came from.
 */
export interface CatalogueItem {
  slug: string;
  name: string;
  image: string;
  weightGrams: number;
  priceInPaise: number;
  inStock: boolean;
}

export function variantSlug(flavourSlug: string, grams: number): string {
  return `${flavourSlug}-${grams}`;
}

/** Every flavour × size combination, built once at module load. */
const variants = new Map<string, CatalogueItem>(
  flavours.flatMap((flavour) =>
    packSizes.map((size): [string, CatalogueItem] => {
      const slug = variantSlug(flavour.slug, size.grams);
      return [
        slug,
        {
          slug,
          name: `${flavour.name} · ${size.grams}g`,
          image: flavour.image,
          weightGrams: size.grams,
          priceInPaise: size.priceInPaise,
          inStock: true,
        },
      ];
    }),
  ),
);

/**
 * Combos are single SKUs, so they go in the cart as one line rather than as
 * their constituent packs. Prefixed to keep them from colliding with a flavour
 * slug of the same name.
 */
export function comboSlug(slug: string): string {
  return `combo-${slug}`;
}

const comboItems = new Map<string, CatalogueItem>(
  combos.map((combo): [string, CatalogueItem] => {
    const slug = comboSlug(combo.slug);
    return [
      slug,
      {
        slug,
        name: combo.name,
        image: combo.image,
        weightGrams: totalGrams(combo),
        priceInPaise: combo.priceInPaise,
        inStock: combo.inStock,
      },
    ];
  }),
);

export function getCatalogueItem(slug: string): CatalogueItem | undefined {
  const variant = variants.get(slug);
  if (variant) return variant;

  const combo = comboItems.get(slug);
  if (combo) return combo;

  const product = getProduct(slug);
  if (!product) return undefined;

  return {
    slug: product.slug,
    name: product.name,
    image: product.image,
    weightGrams: product.weightGrams,
    priceInPaise: product.priceInPaise,
    inStock: product.inStock,
  };
}
