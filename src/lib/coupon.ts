import type { PaymentMethod } from '@/types';

export const PREPAID10 = 'PREPAID10';

export interface CouponResolution {
  code: string | null;
  discountInPaise: number;
  error?: string;
}

/** Shared checkout rule. The server always resolves this again before charging. */
export function resolveCoupon(
  rawCode: string | undefined,
  paymentMethod: PaymentMethod,
  subtotalInPaise: number,
): CouponResolution {
  const code = rawCode?.trim().toUpperCase() ?? '';
  if (!code) return { code: null, discountInPaise: 0 };
  if (code !== PREPAID10) {
    return { code, discountInPaise: 0, error: 'That coupon code is not valid.' };
  }
  if (paymentMethod !== 'prepaid') {
    return { code, discountInPaise: 0, error: 'PREPAID10 is available for online payment only.' };
  }
  return { code, discountInPaise: Math.floor(subtotalInPaise * 0.1) };
}
