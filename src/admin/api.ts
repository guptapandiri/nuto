/**
 * Admin API client.
 *
 * Auth rides on an httpOnly session cookie, so there is no token for this code
 * to hold or leak — every call just needs `credentials: 'include'`.
 */

export class ApiError extends Error {
  // Declared explicitly rather than as constructor parameter properties, which
  // `erasableSyntaxOnly` disallows.
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(apiUrl(`/api${path}`), {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(response.status, body.error ?? 'request_failed');
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, body === undefined
      ? { method: 'POST' }
      : { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/* ------------------------------------------------------------------ types */

export type OrderStatus =
  | 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'failed';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface OrderSummary {
  id: string;
  reference: string;
  status: OrderStatus;
  paymentMethod: 'prepaid' | 'cod';
  paymentStatus: PaymentStatus;
  totalPaise: number;
  customerName: string;
  customerMobile: string;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  itemCount: number;
}

export interface OrderItem {
  sku: string;
  kind: 'variant' | 'combo';
  name: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
}

export interface OrderEvent {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  note: string;
  actor: string;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  customerEmail: string;
  subtotalPaise: number;
  shippingPaise: number;
  codFeePaise: number;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  adminNotes: string;
  trackingUrl: string | null;
  updatedAt: string;
  items: OrderItem[];
  events: OrderEvent[];
}

export interface Stats {
  orders: number;
  revenuePaise: number;
  pending: number;
  ordersToday: number;
  revenueTodayPaise: number;
  byStatus: { status: OrderStatus; count: number }[];
  lowStock: { sku: string; name: string; stock: number }[];
  topSellers: { name: string; units: number; revenue: number }[];
}

export interface InventoryVariant {
  sku: string;
  flavour: string;
  grams: number;
  stock: number;
  isActive: boolean;
  pricePaise: number;
}

export interface InventoryCombo {
  slug: string;
  name: string;
  stock: number;
  isActive: boolean;
  pricePaise: number;
}

export type PromotionKind = 'product_launch' | 'offer' | 'announcement';

export interface Promotion {
  id: string;
  kind: PromotionKind;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled',
];

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function money(paise: number): string {
  return inr.format(paise / 100);
}

export function when(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(iso));
}
import { apiUrl } from '@/lib/api';
