/**
 * The proposed range: 7 flavours × 3 pack sizes, priced by size.
 *
 * Flavour names and all three prices are as given by the owner on 2026-07-27.
 * Everything else here — accent colours, tasting notes, heat levels — is
 * placeholder art direction for the concept pages and has not been approved.
 *
 * Kept separate from src/data/products.ts so the live storefront is untouched
 * while these directions are being judged.
 */

export interface PackSize {
  grams: number;
  priceInPaise: number;
}

/** Priced by size, identical across flavours. */
export const packSizes: PackSize[] = [
  { grams: 50, priceInPaise: 7900 },
  { grams: 100, priceInPaise: 14900 },
  { grams: 200, priceInPaise: 29900 },
];

export type HeatLevel = 0 | 1 | 2 | 3;

export interface Flavour {
  slug: string;
  name: string;
  /** One line, used under the name. */
  note: string;
  /** Longer line for the concepts that have room. */
  blurb: string;
  /** Hex accent. All chosen to clear 4.5:1 against white text. */
  accent: string;
  heat: HeatLevel;
  /**
   * PLACEHOLDER PHOTOGRAPHY. Square crops of the existing jars, taken below
   * the printed flavour name so the old label text (ORIGINAL / FIRE / VELVET /
   * ZEST / SMOKE) is not visible. The nuts and label colour are real; the
   * pairing to these new flavours is not. Reshoot before launch.
   */
  image: string;
  /** Invented social proof, for layout only. */
  rating: number;
  reviewCount: number;
  /** Live stock by pack size when the catalogue has been loaded from the API. */
  variants?: { grams: number; stock: number }[];
}

export const flavours: Flavour[] = [
  {
    slug: 'salted',
    name: 'Salted',
    note: 'The plain one',
    blurb: 'Roasted, salted, finished. The one you buy when you actually want to taste the cashew.',
    accent: '#6E675B',
    heat: 0,
    image: '/flavours/salted.png',
    rating: 4.6,
    reviewCount: 212,
  },
  {
    slug: 'black-pepper',
    name: 'Black Pepper',
    note: 'Coarse cracked pepper',
    blurb: 'Cracked coarse, not powdered, so you get the sting in flashes instead of all at once.',
    accent: '#33383B',
    heat: 1,
    image: '/flavours/black-pepper.jpg',
    rating: 4.4,
    reviewCount: 86,
  },
  {
    slug: 'masala',
    name: 'Masala',
    note: 'The house blend',
    blurb: 'The blend everyone has an opinion about. Warm, layered, faintly sour at the end.',
    accent: '#96491F',
    heat: 1,
    image: '/flavours/masala.jpg',
    rating: 4.7,
    reviewCount: 341,
  },
  {
    slug: 'maggi-masala',
    name: 'Maggi Masala',
    note: 'You know exactly what this tastes like',
    blurb: 'No explanation required. It tastes like being eleven and getting home from school.',
    accent: '#9C5E0C',
    heat: 1,
    image: '/flavours/maggi-masala.jpg',
    rating: 4.8,
    reviewCount: 508,
  },
  {
    slug: 'sweet-chilli',
    name: 'Sweet Chilli',
    note: 'Sweet first, heat after',
    blurb: 'Sticky and sweet on the way in, with the burn arriving about two seconds late.',
    accent: '#B23A2B',
    heat: 2,
    image: '/flavours/sweet-chilli.png',
    rating: 4.5,
    reviewCount: 164,
  },
  {
    slug: 'lemon-chilli',
    name: 'Lemon Chilli',
    note: 'Sharp and sour',
    blurb: 'Sour enough to make you pull a face, then immediately reach for another one.',
    accent: '#8A7A0F',
    heat: 2,
    image: '/flavours/lemon-chilli.jpg',
    rating: 4.6,
    reviewCount: 129,
  },
  {
    slug: 'peri-peri',
    name: 'Peri Peri',
    note: 'The hottest one',
    blurb: 'Tangy, garlicky and genuinely hot. The jar that empties last and then all at once.',
    accent: '#A81E14',
    heat: 3,
    image: '/flavours/peri-peri.jpg',
    rating: 4.9,
    reviewCount: 447,
  },
];

/** ₹79 → "79". Concepts show whole rupees; there are no paise in these prices. */
export function rupees(paise: number): string {
  return new Intl.NumberFormat('en-IN').format(Math.round(paise / 100));
}

export function priceRange(): { min: number; max: number } {
  const prices = packSizes.map((size) => size.priceInPaise);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}
