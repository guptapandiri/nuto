import { useEffect, useState } from 'react';
import { api, money, type Stats } from './api';

export function DashboardTab({ onViewOrders }: { onViewOrders: () => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Stats>('/admin/stats')
      .then(setStats)
      .catch(() => setError('Could not load stats.'));
  }, []);

  if (error) return <p className="text-[13px] text-red-600">{error}</p>;
  if (!stats) return <p className="text-[13px] text-neutral-500">Loading…</p>;

  const cards = [
    { label: 'Orders today', value: String(stats.ordersToday) },
    { label: 'Revenue today', value: money(stats.revenueTodayPaise) },
    { label: 'Awaiting action', value: String(stats.pending), accent: stats.pending > 0 },
    { label: 'Orders all time', value: String(stats.orders) },
    { label: 'Revenue all time', value: money(stats.revenuePaise) },
  ];

  return (
    <div className="space-y-6">
      <section>
        <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((card) => (
            <li
              key={card.label}
              className="rounded-xl border border-neutral-200 bg-white p-4"
            >
              <p className="text-[12px] text-neutral-500">{card.label}</p>
              <p
                className={`mt-1 text-2xl font-bold tabular-nums ${
                  card.accent ? 'text-[#E23744]' : ''
                }`}
              >
                {card.value}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-[14px] font-bold">Orders by status</h2>
          {stats.byStatus.length === 0 ? (
            <p className="mt-3 text-[13px] text-neutral-500">No orders yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.byStatus.map((row) => (
                <li key={row.status} className="flex items-center justify-between text-[13px]">
                  <span className="capitalize">{row.status}</span>
                  <span className="font-semibold tabular-nums">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={onViewOrders}
            className="mt-4 text-[13px] font-semibold text-[#1B7A4B] underline-offset-4 hover:underline"
          >
            View all orders →
          </button>
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-[14px] font-bold">Low stock</h2>
          {stats.lowStock.length === 0 ? (
            <p className="mt-3 text-[13px] text-neutral-500">Nothing running low.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.lowStock.map((row) => (
                <li key={row.sku} className="flex items-center justify-between text-[13px]">
                  <span>{row.name}</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      row.stock === 0 ? 'text-[#E23744]' : 'text-amber-600'
                    }`}
                  >
                    {row.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-neutral-200 bg-white p-4">
          <h2 className="text-[14px] font-bold">Top sellers</h2>
          {stats.topSellers.length === 0 ? (
            <p className="mt-3 text-[13px] text-neutral-500">No sales yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.topSellers.map((row) => (
                <li key={row.name} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate">{row.name}</span>
                  <span className="shrink-0 text-neutral-500 tabular-nums">
                    {row.units} · {money(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
