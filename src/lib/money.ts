/**
 * Money is handled everywhere as integer paise. Only format at the point of
 * display, never store or arithmetic on the formatted value.
 */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** ₹1,299.00 — with Indian digit grouping (lakh/crore), not thousands. */
export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}

/** ₹1,299 — drops the paise when they are zero, keeps them when they are not. */
export function formatPaiseCompact(paise: number): string {
  return paise % 100 === 0 ? inrWhole.format(paise / 100) : inr.format(paise / 100);
}

/** Percentage saved against MRP, rounded down. Returns 0 when there is no discount. */
export function discountPercent(priceInPaise: number, mrpInPaise?: number): number {
  if (!mrpInPaise || mrpInPaise <= priceInPaise) return 0;
  return Math.floor(((mrpInPaise - priceInPaise) / mrpInPaise) * 100);
}
