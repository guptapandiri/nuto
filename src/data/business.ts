/**
 * ============================================================================
 *  PLACEHOLDER COMMERCIAL & LEGAL DETAILS — REPLACE BEFORE GOING LIVE
 * ============================================================================
 *  Every value marked PLACEHOLDER below is invented. An Indian food business
 *  is legally required to display a real FSSAI licence number, and a real
 *  registered address, on the website. Swap these for the genuine values before
 *  taking a single order. Nothing else in the codebase hardcodes them.
 * ============================================================================
 */

export const business = {
  name: 'Nuto',
  legalName: 'Nuto Foods (PLACEHOLDER — registered entity name)',
  tagline: 'Flavor in every fold',
  city: 'Hyderabad',

  /** PLACEHOLDER — a real 14-digit FSSAI licence number is legally required. */
  fssaiLicence: '10000000000000',

  /** PLACEHOLDER — registered address shown in the footer and policies. */
  address: {
    line1: 'PLACEHOLDER Address Line 1',
    line2: 'PLACEHOLDER Area',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
  },

  /** PLACEHOLDER — no mailbox is set up for this address yet. */
  email: 'hello@nuto.in',
  /** Real contact number. */
  phone: '+91 99495 04441',
  /** Digits only, with country code — used to build wa.me links. */
  whatsapp: '919949504441',

  instagram: 'https://www.instagram.com/nutoproducts/',
} as const;

/**
 * Shipping and fee rules, in integer paise.
 * PLACEHOLDER values — confirm against real courier rates.
 */
export const commerce = {
  freeShippingThresholdInPaise: 49900, // ₹499
  flatShippingInPaise: 6900, // ₹69
  codFeeInPaise: 3900, // ₹39
  /** Prepaid discount is not applied automatically; shown as copy only. */
  maxQuantityPerLine: 10,
} as const;

export function whatsappLink(message: string): string {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}
