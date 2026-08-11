import type { Product } from '@/types';

/**
 * ============================================================================
 *  PLACEHOLDER PRICING — REPLACE WITH REAL PRICES
 * ============================================================================
 *  `priceInPaise` and `mrpInPaise` below are invented for layout purposes.
 *  They are integer paise: ₹649 is 64900. This is the only file that defines
 *  product pricing, so updating it updates the entire site.
 *
 *  Product names, weights and flavour descriptions are taken from the actual
 *  jar labels in the brand's launch photography.
 * ============================================================================
 */
export const products: Product[] = [
  {
    slug: 'original',
    name: 'Original',
    tagline: 'Himalayan pink salt',
    description:
      'The one to start with. Whole W240 cashews, slow-roasted until the edges go golden, then finished with nothing more than Himalayan pink salt. No oil slick, no seasoning dust — just the nut, doing what it does best.',
    flavour: 'savoury',
    weightGrams: 250,
    priceInPaise: 64900,
    mrpInPaise: 74900,
    accentVar: '--color-flavour-original',
    image: '/products/original.jpg',
    ingredients: ['Cashew nuts (W240)', 'Himalayan pink salt'],
    tastingNotes: ['Buttery', 'Clean salt', 'Slow roast'],
    inStock: true,
  },
  {
    slug: 'fire',
    name: 'Fire',
    tagline: 'Chilli roasted',
    description:
      'Built for people who reach for the pickle jar. A blend of Guntur and Kashmiri chilli gives this one real heat with actual flavour behind it — the Kashmiri brings colour and fruit, the Guntur brings the burn.',
    flavour: 'spicy',
    weightGrams: 250,
    priceInPaise: 69900,
    mrpInPaise: 79900,
    accentVar: '--color-flavour-fire',
    image: '/products/fire.jpg',
    ingredients: [
      'Cashew nuts (W240)',
      'Guntur chilli',
      'Kashmiri chilli',
      'Garlic',
      'Salt',
    ],
    tastingNotes: ['Sharp heat', 'Smoky red', 'Garlic finish'],
    inStock: true,
  },
  {
    slug: 'velvet',
    name: 'Velvet',
    tagline: 'Chocolate sea salt',
    description:
      'Dark chocolate and flaky sea salt over a whole roasted cashew. Sweet enough to be dessert, salted enough that you keep going back. This is the one that disappears fastest off a table.',
    flavour: 'sweet',
    weightGrams: 250,
    priceInPaise: 79900,
    mrpInPaise: 89900,
    accentVar: '--color-flavour-velvet',
    image: '/products/velvet.jpg',
    ingredients: [
      'Cashew nuts (W240)',
      'Dark chocolate (54% cocoa)',
      'Cocoa butter',
      'Sea salt',
      'Cane sugar',
    ],
    tastingNotes: ['Bittersweet', 'Flaky salt', 'Slow melt'],
    inStock: true,
  },
  {
    slug: 'zest',
    name: 'Zest',
    tagline: 'Lime & chilli',
    description:
      'Sharp lime, green chilli and a hit of black salt. The one that wakes your mouth up — bright and sour first, warm underneath. Best served cold with something to drink.',
    flavour: 'spicy',
    weightGrams: 250,
    priceInPaise: 69900,
    accentVar: '--color-flavour-zest',
    image: '/products/zest.jpg',
    ingredients: [
      'Cashew nuts (W240)',
      'Lime',
      'Green chilli',
      'Black salt',
      'Curry leaf',
    ],
    tastingNotes: ['Citrus sharp', 'Green heat', 'Black salt'],
    inStock: true,
  },
  {
    slug: 'smoke',
    name: 'Smoke',
    tagline: 'Hickory smoked',
    description:
      'Cold-smoked over hickory before roasting, so the smoke sits inside the nut instead of on top of it. Deep, savoury and a little bit barbecue. Our most grown-up flavour.',
    flavour: 'savoury',
    weightGrams: 230,
    priceInPaise: 74900,
    accentVar: '--color-flavour-smoke',
    image: '/products/smoke.jpg',
    ingredients: [
      'Cashew nuts (W240)',
      'Natural hickory smoke',
      'Paprika',
      'Jaggery',
      'Salt',
    ],
    tastingNotes: ['Woodsmoke', 'Savoury depth', 'Faint sweetness'],
    inStock: true,
  },
  {
    slug: 'milk-choco',
    name: 'Milk Choco',
    tagline: 'Milk chocolate cashews',
    description:
      'Whole cashews folded into smooth milk chocolate, layer after layer, until each one has a proper shell. Made for gifting — and for the people who think Velvet is a little too serious.',
    flavour: 'sweet',
    weightGrams: 200,
    priceInPaise: 74900,
    mrpInPaise: 84900,
    accentVar: '--color-flavour-milk-choco',
    image: '/products/milk-choco.jpg',
    ingredients: [
      'Cashew nuts (W240)',
      'Milk chocolate (32% cocoa)',
      'Milk solids',
      'Cocoa butter',
      'Cane sugar',
    ],
    tastingNotes: ['Creamy', 'Mellow cocoa', 'Thick shell'],
    inStock: true,
  },
];

export const flavourFilters: { value: FlavourFilter; label: string }[] = [
  { value: 'all', label: 'Everything' },
  { value: 'savoury', label: 'Savoury' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'sweet', label: 'Sweet' },
];

export type FlavourFilter = 'all' | 'savoury' | 'spicy' | 'sweet';

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
