import type { GiftBox } from '@/types';

/**
 * PLACEHOLDER PRICING — see src/data/products.ts for the pricing note.
 * Gift boxes are presentational in this build: they link to the enquiry flow
 * rather than adding to the cart, since box SKUs and stock are not defined yet.
 */
export const giftBoxes: GiftBox[] = [
  {
    slug: 'the-full-fold',
    name: 'The Full Fold',
    description:
      'All six flavours in one box. The honest way to find out which one you actually like — and the safest thing to hand someone whose taste you do not know.',
    contents: ['original', 'fire', 'velvet', 'zest', 'smoke', 'milk-choco'],
    priceInPaise: 379900,
    mrpInPaise: 434400,
    image: '/combos/seven-pack-lineup.png',
    inStock: true,
  },
  {
    slug: 'festive-three',
    name: 'Festive Three',
    description:
      'Original, Velvet and Milk Choco, boxed for Diwali, Ugadi and every wedding season in between. Sweet-leaning, so it works for a mixed room.',
    contents: ['original', 'velvet', 'milk-choco'],
    priceInPaise: 199900,
    mrpInPaise: 219700,
    image: '/combos/three-pack.png',
    inStock: true,
  },
  {
    slug: 'the-hot-half',
    name: 'The Hot Half',
    description:
      'Fire, Zest and Smoke. For the person who complains that everything is too mild, and means it.',
    contents: ['fire', 'zest', 'smoke'],
    priceInPaise: 194900,
    mrpInPaise: 214700,
    image: '/combos/three-pack.png',
    inStock: true,
  },
];
