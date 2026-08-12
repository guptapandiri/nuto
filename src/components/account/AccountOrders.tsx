import { useEffect, useState } from 'react';
import { getCatalogueItem } from '@/data/catalogue';
import { useAccount } from '@/hooks/useAccount';
import { useCart } from '@/hooks/useCart';
import { apiUrl } from '@/lib/api';
import { formatPaiseCompact } from '@/lib/money';

type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

interface AccountOrderItem {
  sku: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
}

interface AccountOrder {
  reference: string;
  status: OrderStatus;
  paymentMethod: 'prepaid' | 'cod';
  paymentStatus: 'unpaid' | 'paid' | 'refunded' | 'failed';
  subtotalPaise: number;
  discountPaise: number;
  shippingPaise: number;
  codFeePaise: number;
  totalPaise: number;
  customerName: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
  trackingUrl: string | null;
  createdAt: string;
  updatedAt: string;
  items: AccountOrderItem[];
}

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function AccountOrders() {
  const { closeDrawer } = useAccount();
  const { addItem } = useCart();
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reorderMessage, setReorderMessage] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(apiUrl('/api/account/orders'), { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('orders_unavailable');
        return response.json() as Promise<{ orders: AccountOrder[] }>;
      })
      .then((payload) => {
        if (active) setOrders(payload.orders);
      })
      .catch(() => {
        if (active) setError('We could not load your orders. Please try again.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function reorder(order: AccountOrder) {
    const available = order.items.flatMap((item) => {
      const catalogueItem = getCatalogueItem(item.sku);
      return catalogueItem?.inStock ? [{ ...item, catalogueItem }] : [];
    });

    if (available.length === 0) {
      setReorderMessage('These items are not currently available.');
      return;
    }

    closeDrawer();
    for (const item of available) addItem(item.sku, item.quantity);
  }

  if (isLoading) return <p className="py-8 text-sm text-neutral-500">Loading your orders…</p>;
  if (error) return <p role="alert" className="py-8 text-sm text-[#E23744]">{error}</p>;
  if (orders.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="font-semibold">No orders yet</p>
        <p className="mt-1 text-sm text-neutral-500">Orders placed while logged in will appear here.</p>
      </div>
    );
  }

  const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status));
  const previousOrders = orders.filter((order) => ['delivered', 'cancelled'].includes(order.status));

  return (
    <div className="space-y-7">
      {reorderMessage && <p role="status" className="rounded-lg bg-neutral-100 p-3 text-sm">{reorderMessage}</p>}
      <OrderSection title="Current orders" orders={activeOrders} />
      <OrderSection title="Previous orders" orders={previousOrders} onReorder={reorder} />
    </div>
  );
}

function OrderSection({
  title,
  orders,
  onReorder,
}: {
  title: string;
  orders: AccountOrder[];
  onReorder?: (order: AccountOrder) => void;
}) {
  return (
    <section>
      <h3 className="text-sm font-bold">{title}</h3>
      {orders.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500">None right now.</p>
      ) : (
        <div className="mt-3 space-y-3">
          {orders.map((order, index) => (
            <OrderCard
              key={order.reference}
              order={order}
              defaultOpen={index === 0}
              {...(onReorder ? { onReorder } : {})}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function OrderCard({
  order,
  defaultOpen,
  onReorder,
}: {
  order: AccountOrder;
  defaultOpen: boolean;
  onReorder?: (order: AccountOrder) => void;
}) {
  const cancelled = order.status === 'cancelled';
  return (
    <details open={defaultOpen} className="group rounded-xl border border-neutral-200 bg-white">
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{order.reference}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{formatDate(order.createdAt)} · {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-[11px] font-bold ${cancelled ? 'bg-red-50 text-[#E23744]' : 'bg-[#1B7A4B]/10 text-[#1B7A4B]'}`}>
            {statusLabels[order.status]}
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="font-bold tabular-nums">{formatPaiseCompact(order.totalPaise)}</span>
          <span className="text-xs font-semibold text-neutral-500 group-open:hidden">View details</span>
        </div>
      </summary>

      <div className="border-t border-neutral-200 px-4 pb-4">
        <ul className="divide-y divide-neutral-100">
          {order.items.map((item) => {
            const current = getCatalogueItem(item.sku);
            return (
              <li key={item.sku} className="flex items-center gap-3 py-3">
                {current ? <img src={current.image} alt="" className="size-12 rounded-lg bg-neutral-50 object-cover" /> : <span className="size-12 rounded-lg bg-neutral-100" />}
                <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-neutral-500">Qty {item.quantity}</p></div>
                <span className="text-sm tabular-nums">{formatPaiseCompact(item.lineTotalPaise)}</span>
              </li>
            );
          })}
        </ul>

        <dl className="space-y-1.5 border-t border-neutral-100 pt-3 text-xs">
          <OrderTotal label="Subtotal" value={order.subtotalPaise} />
          {order.discountPaise > 0 && <OrderTotal label="Discount" value={-order.discountPaise} />}
          <OrderTotal label="Shipping" value={order.shippingPaise} free />
          {order.codFeePaise > 0 && <OrderTotal label="COD fee" value={order.codFeePaise} />}
          <div className="flex justify-between pt-1 text-sm font-bold"><dt>Total</dt><dd>{formatPaiseCompact(order.totalPaise)}</dd></div>
        </dl>

        <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
          <p className="font-semibold text-neutral-900">Delivering to {order.customerName}</p>
          <p>{order.addressLine1}, {order.addressLine2}{order.landmark ? `, near ${order.landmark}` : ''}</p>
          <p>{order.city} {order.pincode}, {order.state}</p>
          <p className="mt-1 capitalize">{order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Prepaid'} · {order.paymentStatus}</p>
        </div>

        {order.trackingUrl && (
          <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-[#1B7A4B] underline underline-offset-4">Track order</a>
        )}
        {onReorder && (
          <button type="button" onClick={() => onReorder(order)} className="mt-4 w-full rounded-lg border-2 border-[#1B7A4B] px-4 py-2.5 text-sm font-bold text-[#1B7A4B] hover:bg-[#1B7A4B] hover:text-white">
            REORDER
          </button>
        )}
      </div>
    </details>
  );
}

function OrderTotal({ label, value, free = false }: { label: string; value: number; free?: boolean }) {
  return <div className="flex justify-between"><dt className="text-neutral-500">{label}</dt><dd>{free && value === 0 ? 'Free' : formatPaiseCompact(value)}</dd></div>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
}
