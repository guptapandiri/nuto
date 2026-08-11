import { commerce } from '@/data/business';
import { resolveCoupon } from '@/lib/coupon';
import type { OrderTotals, PaymentMethod, ResolvedCartLine } from '@/types';

/**
 * Single source of truth for order arithmetic — the cart page, the checkout
 * summary and the confirmation page all read from here so they cannot disagree.
 */
export function calculateTotals(
  lines: ResolvedCartLine[],
  paymentMethod: PaymentMethod = 'prepaid',
  couponCode?: string,
): OrderTotals {
  const subtotalInPaise = lines.reduce((sum, line) => sum + line.lineTotalInPaise, 0);
  const coupon = resolveCoupon(couponCode, paymentMethod, subtotalInPaise);

  const qualifiesForFreeShipping =
    subtotalInPaise >= commerce.freeShippingThresholdInPaise;

  // An empty cart should never show a shipping charge.
  const shippingInPaise =
    subtotalInPaise === 0 || qualifiesForFreeShipping ? 0 : commerce.flatShippingInPaise;

  const codFeeInPaise =
    paymentMethod === 'cod' && subtotalInPaise > 0 ? commerce.codFeeInPaise : 0;

  return {
    subtotalInPaise,
    discountInPaise: coupon.discountInPaise,
    shippingInPaise,
    codFeeInPaise,
    totalInPaise: subtotalInPaise - coupon.discountInPaise + shippingInPaise + codFeeInPaise,
    freeShippingShortfallInPaise: Math.max(
      0,
      commerce.freeShippingThresholdInPaise - subtotalInPaise,
    ),
  };
}
