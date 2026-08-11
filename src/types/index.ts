export type FlavourProfile = 'savoury' | 'spicy' | 'sweet';

export interface Product {
  /** URL segment, e.g. /product/fire */
  slug: string;
  name: string;
  /** One line under the name on cards. */
  tagline: string;
  description: string;
  flavour: FlavourProfile;
  /** Net weight, displayed per Legal Metrology rules. */
  weightGrams: number;
  /** Integer paise. Never store money as a float. */
  priceInPaise: number;
  /** Optional MRP for strike-through pricing; must be > priceInPaise. */
  mrpInPaise?: number;
  /** CSS custom property name holding this flavour's accent colour. */
  accentVar: string;
  image: string;
  ingredients: string[];
  /** Short "what it tastes like" notes, shown as chips on the product page. */
  tastingNotes: string[];
  inStock: boolean;
}

export interface GiftBox {
  slug: string;
  name: string;
  description: string;
  /** Slugs of the products included. */
  contents: string[];
  priceInPaise: number;
  mrpInPaise?: number;
  image: string;
  inStock: boolean;
}

export interface CartLine {
  slug: string;
  quantity: number;
}

/** A cart line resolved against the catalogue, with its computed total. */
export interface ResolvedCartLine {
  slug: string;
  name: string;
  image: string;
  weightGrams: number;
  unitPriceInPaise: number;
  quantity: number;
  lineTotalInPaise: number;
  inStock: boolean;
}

export interface OrderTotals {
  subtotalInPaise: number;
  discountInPaise: number;
  shippingInPaise: number;
  codFeeInPaise: number;
  totalInPaise: number;
  /** How much more is needed to unlock free shipping; 0 once unlocked. */
  freeShippingShortfallInPaise: number;
}

export type PaymentMethod = 'prepaid' | 'cod';

export interface ShippingAddress {
  fullName: string;
  mobile: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlacedOrder {
  reference: string;
  placedAt: string;
  lines: ResolvedCartLine[];
  totals: OrderTotals;
  address: ShippingAddress;
  paymentMethod: PaymentMethod;
}
