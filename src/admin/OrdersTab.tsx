import { useCallback, useEffect, useState } from 'react';
import {
  api, money, ORDER_STATUSES, when,
  type OrderDetail, type OrderStatus, type OrderSummary,
} from './api';

const statusStyles: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-violet-100 text-violet-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-neutral-200 text-neutral-600',
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function OrdersTab() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (status) params.set('status', status);
    if (search.trim()) params.set('q', search.trim());
    try {
      const data = await api.get<{ orders: OrderSummary[]; total: number }>(
        `/admin/orders?${params}`,
      );
      setOrders(data.orders);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  // Debounced so typing in the search box does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Reference, name, mobile or email"
          className="min-w-56 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-[16px] focus:border-[#1B7A4B] focus:outline-none sm:text-[14px]"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | '')}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[14px] focus:border-[#1B7A4B] focus:outline-none"
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s[0]!.toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span className="text-[13px] text-neutral-500">{total} orders</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[46rem] text-left text-[13px]">
          <thead className="border-b border-neutral-200 text-[12px] text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Placed</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Deliver to</th>
              <th className="px-4 py-3 font-medium">Pay</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {loading && orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">Loading…</td></tr>
            )}
            {!loading && orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-neutral-500">No orders match.</td></tr>
            )}
            {orders.map((order) => (
              <tr
                key={order.id}
                onClick={() => setSelected(order.id)}
                className="cursor-pointer hover:bg-neutral-50"
              >
                <td className="px-4 py-3 font-mono text-[12px] font-semibold">{order.reference}</td>
                <td className="px-4 py-3 text-neutral-500">{when(order.createdAt)}</td>
                <td className="px-4 py-3">
                  {order.customerName}
                  <span className="block text-[12px] text-neutral-500">+91 {order.customerMobile}</span>
                </td>
                <td className="px-4 py-3 text-neutral-500">
                  {order.city}, {order.state} {order.pincode}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase">
                    {order.paymentMethod}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {money(order.totalPaise)}
                </td>
                <td className="px-4 py-3"><StatusPill status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <OrderDrawer
          orderId={selected}
          onClose={() => setSelected(null)}
          onChanged={() => void load()}
        />
      )}
    </div>
  );
}

function OrderDrawer({
  orderId,
  onClose,
  onChanged,
}: {
  orderId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [tracking, setTracking] = useState('');

  const load = useCallback(async () => {
    const data = await api.get<OrderDetail>(`/admin/orders/${orderId}`);
    setOrder(data);
    setNotes(data.adminNotes);
    setTracking(data.trackingUrl ?? '');
  }, [orderId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function update(patch: Record<string, unknown>) {
    setSaving(true);
    try {
      await api.patch(`/admin/orders/${orderId}`, patch);
      await load();
      onChanged();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order detail"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col overflow-y-auto bg-white shadow-2xl"
      >
        {!order ? (
          <p className="p-6 text-[13px] text-neutral-500">Loading…</p>
        ) : (
          <>
            <div className="sticky top-0 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-4">
              <div>
                <h2 className="font-mono text-[15px] font-bold">{order.reference}</h2>
                <p className="text-[12px] text-neutral-500">{when(order.createdAt)}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-[13px] hover:border-neutral-900"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-5">
              <section>
                <h3 className="text-[12px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Status
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {ORDER_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={saving || s === order.status}
                      onClick={() => void update({ status: s })}
                      className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors disabled:opacity-100 ${
                        s === order.status
                          ? 'border-neutral-900 bg-neutral-900 text-white'
                          : 'border-neutral-300 hover:border-neutral-900 disabled:opacity-40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(['unpaid', 'paid', 'refunded', 'failed'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={saving || s === order.paymentStatus}
                      onClick={() => void update({ paymentStatus: s })}
                      className={`rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize ${
                        s === order.paymentStatus
                          ? 'border-[#1B7A4B] bg-[#1B7A4B] text-white'
                          : 'border-neutral-300 hover:border-neutral-900 disabled:opacity-40'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Items
                </h3>
                <ul className="mt-2 divide-y divide-neutral-100 rounded-lg border border-neutral-200">
                  {order.items.map((item) => (
                    <li key={item.sku} className="flex justify-between gap-3 px-3 py-2.5 text-[13px]">
                      <span>
                        {item.name}
                        <span className="text-neutral-500"> × {item.quantity}</span>
                        <span className="ml-2 rounded bg-neutral-100 px-1 text-[10px] uppercase">
                          {item.kind}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums">{money(item.lineTotalPaise)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-3 space-y-1 text-[13px]">
                  <Row label="Subtotal" value={money(order.subtotalPaise)} />
                  <Row label="Shipping" value={order.shippingPaise === 0 ? 'Free' : money(order.shippingPaise)} />
                  {order.codFeePaise > 0 && <Row label="COD fee" value={money(order.codFeePaise)} />}
                  <Row label="Total" value={money(order.totalPaise)} bold />
                </dl>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Deliver to
                </h3>
                <address className="mt-2 rounded-lg border border-neutral-200 p-3 text-[13px] leading-relaxed not-italic">
                  <strong>{order.customerName}</strong><br />
                  {order.addressLine1}<br />
                  {order.addressLine2}<br />
                  {order.landmark && <>Near {order.landmark}<br /></>}
                  {order.city} {order.pincode}, {order.state}<br />
                  <a href={`tel:+91${order.customerMobile}`} className="text-[#1B7A4B]">+91 {order.customerMobile}</a>
                  {' · '}
                  <a href={`mailto:${order.customerEmail}`} className="text-[#1B7A4B]">{order.customerEmail}</a>
                </address>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold tracking-wide text-neutral-500 uppercase">
                  Tracking &amp; notes
                </h3>
                <input
                  type="url"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="https://tracking-url…"
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[14px] focus:border-[#1B7A4B] focus:outline-none"
                />
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Internal notes…"
                  className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-[14px] focus:border-[#1B7A4B] focus:outline-none"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    void update({ adminNotes: notes, trackingUrl: tracking.trim() || null })
                  }
                  className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </section>

              <section>
                <h3 className="text-[12px] font-semibold tracking-wide text-neutral-500 uppercase">
                  History
                </h3>
                <ol className="mt-2 space-y-2 text-[12px]">
                  {order.events.map((event, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-neutral-400">{when(event.createdAt)}</span>
                      <span>
                        {event.fromStatus ? `${event.fromStatus} → ` : ''}
                        <strong>{event.toStatus}</strong>
                        <span className="text-neutral-500"> · {event.actor}</span>
                        {event.note && <span className="text-neutral-500"> — {event.note}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'border-t border-neutral-200 pt-1 font-bold' : ''}`}>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
