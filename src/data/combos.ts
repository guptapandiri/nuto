import { flavours, packSizes } from './range';

/**
 * Combos are a main product line, not a gifting sideline — value packs,
 * samplers and household sizes alongside the single flavours.
 *
 * Each is its own SKU with its own price. The "you save" figure is derived
 * from the constituent pack prices rather than stored, so it can never drift
 * out of sync with the price list in range.ts.
 *
 * PLACEHOLDER PRICING — the three single-pack prices came from the owner; the
 * combo prices below are invented, though each is set to a genuine discount
 * against the sum of its parts.
 */

export interface ComboItem {
  flavourSlug: string;
  grams: number;
  quantity: number;
}

export interface Combo {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  items: ComboItem[];
  priceInPaise: number;
  image: string;
  badge?: string;
  inStock: boolean;
}

export const combos: Combo[] = [
  {
    slug: 'taster-box',
    name: 'Taster Box',
    tagline: 'All 7 flavours · 50g each',
    description:
      'Every flavour we make, in the small size. The honest way to find out which two you actually want before committing to a big pack.',
    items: flavours.map((flavour) => ({ flavourSlug: flavour.slug, grams: 50, quantity: 1 })),
    priceInPaise: 54900,
    image: '/combos/seven-pack-lineup.png',
    badge: 'Most popular',
    inStock: true,
  },
  {
    slug: 'everyday-trio',
    name: 'Everyday Trio',
    tagline: 'Salted, Masala, Black Pepper · 100g each',
    description:
      'The three that disappear fastest in a normal house. Nothing too hot, nothing anyone will refuse.',
    items: [
      { flavourSlug: 'salted', grams: 100, quantity: 1 },
      { flavourSlug: 'masala', grams: 100, quantity: 1 },
      { flavourSlug: 'black-pepper', grams: 100, quantity: 1 },
    ],
    priceInPaise: 39900,
    image: '/combos/three-pack.png',
    inStock: true,
  },
  {
    slug: 'heat-seeker',
    name: 'Heat Seeker',
    tagline: 'The three hot ones · 100g each',
    description:
      'Peri Peri, Sweet Chilli and Lemon Chilli. For the person who says everything is too mild and genuinely means it.',
    items: [
      { flavourSlug: 'peri-peri', grams: 100, quantity: 1 },
      { flavourSlug: 'sweet-chilli', grams: 100, quantity: 1 },
      { flavourSlug: 'lemon-chilli', grams: 100, quantity: 1 },
    ],
    priceInPaise: 39900,
    image: '/combos/three-pack.png',
    badge: 'Bestseller',
    inStock: true,
  },
  {
    slug: 'office-pack',
    name: 'Office Pack',
    tagline: '5 flavours · 100g each',
    description:
      'Enough variety that the desk drawer stays interesting for a fortnight. Mild through medium, so it suits a whole floor.',
    items: [
      { flavourSlug: 'salted', grams: 100, quantity: 1 },
      { flavourSlug: 'masala', grams: 100, quantity: 1 },
      { flavourSlug: 'maggi-masala', grams: 100, quantity: 1 },
      { flavourSlug: 'black-pepper', grams: 100, quantity: 1 },
      { flavourSlug: 'sweet-chilli', grams: 100, quantity: 1 },
    ],
    priceInPaise: 64900,
    image: '/combos/five-pack.png',
    inStock: true,
  },
  {
    slug: 'family-pack',
    name: 'Family Pack',
    tagline: '3 crowd-pleasers · 200g each',
    description:
      'The big jars of the three nobody argues about. Buy once, stop thinking about it for a month.',
    items: [
      { flavourSlug: 'salted', grams: 200, quantity: 1 },
      { flavourSlug: 'masala', grams: 200, quantity: 1 },
      { flavourSlug: 'maggi-masala', grams: 200, quantity: 1 },
    ],
    priceInPaise: 74900,
    image: '/combos/three-pack.png',
    badge: 'Best value',
    inStock: true,
  },
  {
    slug: 'party-pack',
    name: 'Party Pack',
    tagline: 'All 7 flavours · 200g each',
    description:
      'Everything, in the big size. Built for Diwali evenings, house parties and the wedding season.',
    items: flavours.map((flavour) => ({ flavourSlug: flavour.slug, grams: 200, quantity: 1 })),
    priceInPaise: 199900,
    image: '/combos/seven-pack-lineup.png',
    inStock: true,
  },
];

/** What the same contents would cost bought as individual packs. */
export function partsTotalInPaise(combo: Combo): number {
  return combo.items.reduce((sum, item) => {
    const size = packSizes.find((option) => option.grams === item.grams);
    return sum + (size ? size.priceInPaise * item.quantity : 0);
  }, 0);
}

export function savingsInPaise(combo: Combo): number {
  return Math.max(0, partsTotalInPaise(combo) - combo.priceInPaise);
}

export function savingsPercent(combo: Combo): number {
  const parts = partsTotalInPaise(combo);
  if (parts <= 0) return 0;
  return Math.round((savingsInPaise(combo) / parts) * 100);
}

/** Total grams in the box — the number people actually compare on. */
export function totalGrams(combo: Combo): number {
  return combo.items.reduce((sum, item) => sum + item.grams * item.quantity, 0);
}

export function getCombo(slug: string): Combo | undefined {
  return combos.find((combo) => combo.slug === slug);
}
