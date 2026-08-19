import { useState } from 'react';
import type { AdminUser } from './api';
import { DashboardTab } from './DashboardTab';
import { InventoryTab } from './InventoryTab';
import { OrdersTab } from './OrdersTab';
import { SettingsTab } from './SettingsTab';
import { PromotionsTab } from './PromotionsTab';

const tabs = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'promotions', label: 'Promotions' },
  { key: 'settings', label: 'Settings' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function AdminShell({
  user,
  onSignOut,
}: {
  user: AdminUser;
  onSignOut: () => void;
}) {
  const [tab, setTab] = useState<TabKey>('dashboard');

  return (
    <div className="min-h-dvh bg-neutral-100">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <img src="/nuto-wordmark.svg" alt="Nuto" className="h-6 w-auto" />
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
            Admin
          </span>

          <nav className="order-3 -mb-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:mb-0 sm:w-auto">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={tab === item.key ? 'page' : undefined}
                className={`shrink-0 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                  tab === item.key
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 text-[13px]">
            <span className="hidden text-neutral-500 sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium hover:border-neutral-900"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {tab === 'dashboard' && <DashboardTab onViewOrders={() => setTab('orders')} />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'inventory' && <InventoryTab />}
        {tab === 'promotions' && <PromotionsTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
}
