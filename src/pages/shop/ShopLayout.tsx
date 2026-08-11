import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { business } from '@/data/business';
import { rupees } from '@/data/range';
import { useCart } from '@/hooks/useCart';
import { OfferStrip, ShopHeader } from './ShopHeader';

export const trustPoints = [
  ['100% Vegetarian', 'FSSAI certified'],
  ['Free shipping', 'On orders above ₹499'],
  ['Cash on Delivery', 'Available across India'],
  ['Sealed for freshness', 'Dispatched in 48 hours'],
] as const;

export function TrustStrip() {
  return (
    <section className="border-b border-neutral-200 bg-white">
      <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-4 text-[11px] font-medium sm:grid-cols-4 sm:text-[13px]">
        {trustPoints.map(([title, sub]) => (
          <li key={title} className="flex items-start gap-2">
            <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#1B7A4B]">
              <svg viewBox="0 0 24 24" className="size-2.5 text-white" fill="none" aria-hidden="true">
                <path
                  d="m5 13 4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              {title}
              <span className="block font-normal text-neutral-500">{sub}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Shared chrome for the commerce pages: offer strip, header with live search,
 * footer, cart drawer and the mobile sticky cart bar.
 *
 * Search lives here rather than in the page so it works from product and combo
 * pages too. Submitting a search opens the grid with the query applied.
 */
export function ShopLayout({
  query,
  onQueryChange,
  children,
}: {
  query?: string;
  onQueryChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  const { itemCount, subtotalInPaise, openDrawer } = useCart();
  const navigate = useNavigate();
  const [localQuery, setLocalQuery] = useState('');

  const value = query ?? localQuery;
  const setValue = onQueryChange ?? setLocalQuery;

  function submitSearch() {
    const params = new URLSearchParams();
    const trimmed = value.trim();
    if (trimmed) params.set('q', trimmed);
    navigate({ pathname: '/search', search: params.toString() });
  }

  return (
    <div className="min-h-dvh bg-neutral-50 pb-20 sm:pb-0">
      <OfferStrip />
      <ShopHeader query={value} onQueryChange={setValue} onQuerySubmit={submitSearch} />

      {children}

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-[12px] text-neutral-500">
          <img src="/nuto-logo.svg" alt="Nuto" className="h-11 w-auto" />
          <nav className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {[
              { to: '/policies/shipping', label: 'Shipping' },
              { to: '/policies/returns', label: 'Returns' },
              { to: '/policies/privacy', label: 'Privacy' },
              { to: '/policies/terms', label: 'Terms' },
              { to: '/contact', label: 'Contact' },
            ].map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="mt-5">
            {business.name} · {business.address.city} {business.address.pincode} · FSSAI{' '}
            {business.fssaiLicence}
          </p>
          <p className="mt-1">{business.phone}</p>
        </div>
      </footer>

      {itemCount > 0 && (
        <button
          type="button"
          onClick={openDrawer}
          className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between bg-[#1B7A4B] px-4 py-3 text-white sm:hidden"
        >
          <span className="text-[13px] font-medium">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} · ₹{rupees(subtotalInPaise)}
          </span>
          <span className="text-[13px] font-bold">View cart →</span>
        </button>
      )}

      <CartDrawer />
    </div>
  );
}
