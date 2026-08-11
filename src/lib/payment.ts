import type { PaymentMethod, ResolvedCartLine, ShippingAddress } from '@/types';
import { apiUrl } from './api';

/**
 * Order submission.
 *
 * The client sends SKUs, quantities and the delivery address — and nothing
 * else. Every price, fee and total is recomputed by the server against the
 * database, so a tampered cart cannot change what is charged. The response
 * carries the authoritative totals back for display.
 *
 * PAYMENT: no gateway is connected yet. Orders are persisted with
 * payment_status = 'unpaid'. To add Razorpay:
 *   1. Create the Razorpay order server-side in POST /api/orders using the key
 *      SECRET, which must never reach this bundle.
 *   2. Open Razorpay Checkout here with the returned order_id.
 *   3. Verify the payment signature server-side before marking the order paid —
 *      a client-side success callback is not proof of payment.
 */

export interface SubmitOrderResult {
  reference: string;
  placedAt: string;
  totals: {
    subtotalPaise: number;
    discountPaise: number;
    shippingPaise: number;
    codFeePaise: number;
    totalPaise: number;
  };
  lines: {
    sku: string;
    name: string;
    unitPricePaise: number;
    quantity: number;
    lineTotalPaise: number;
  }[];
}

export class OrderError extends Error {
  readonly code: string;
  readonly details: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export async function submitOrder(
  lines: ResolvedCartLine[],
  address: ShippingAddress,
  paymentMethod: PaymentMethod,
  couponCode?: string,
): Promise<SubmitOrderResult> {
  if (lines.length === 0) {
    throw new OrderError('empty_cart', 'Cannot place an order with an empty cart.');
  }

  const response = await fetch(apiUrl('/api/orders'), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      lines: lines.map((line) => ({ sku: line.slug, quantity: line.quantity })),
      paymentMethod,
      couponCode,
      address,
    }),
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  if (!response.ok) {
    const code = typeof body['error'] === 'string' ? body['error'] : 'server_error';
    throw new OrderError(code, messageFor(code, body), body);
  }

  return body as unknown as SubmitOrderResult;
}

function messageFor(code: string, body: Record<string, unknown>): string {
  switch (code) {
    case 'out_of_stock': {
      const items = Array.isArray(body['items']) ? (body['items'] as { name?: string }[]) : [];
      const names = items.map((item) => item.name).filter(Boolean).join(', ');
      return names
        ? `Sorry — ${names} just went out of stock. Adjust your cart and try again.`
        : 'Some items just went out of stock. Adjust your cart and try again.';
    }
    case 'quantity_limit':
      return 'One of your items exceeds the maximum quantity per order.';
    case 'unknown_skus':
      return 'Some items in your cart are no longer available.';
    case 'validation_failed':
      return 'Please check your delivery details and try again.';
    case 'invalid_coupon':
      return typeof body['message'] === 'string' ? body['message'] : 'That coupon cannot be applied.';
    case 'rate_limited':
      return 'Too many attempts. Please wait a moment and try again.';
    default:
      return 'Something went wrong placing your order. Please try again.';
  }
}
