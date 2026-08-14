import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useAccount } from '@/hooks/useAccount';

const menuLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/gifting', label: 'Gifting' },
  { to: '/story', label: 'Our story' },
  { to: '/contact', label: 'Contact' },
];

export function CustomerMenu({ compact = false }: { compact?: boolean }) {
  const { account, openDrawer, openOrders, logout } = useAccount();
  const [isOpen, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  function showProfile() {
    setOpen(false);
    openDrawer();
  }

  function showOrders() {
    setOpen(false);
    openOrders();
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className={
          compact
            ? 'flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sand'
            : 'flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-[13px] font-medium hover:border-neutral-900'
        }
      >
        <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
        {!compact && <span className="hidden sm:inline">Menu</span>}
      </button>

      {isOpen && (
        <div role="menu" aria-label="Customer menu" className="absolute top-[calc(100%+0.65rem)] right-0 z-50 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white text-neutral-900 shadow-xl">
          {account ? (
            <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="truncate text-sm font-bold">{account.name}</p>
              <p className="truncate text-xs text-neutral-500">{account.email}</p>
            </div>
          ) : (
            <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-sm font-bold">Welcome to Nuto</p>
              <p className="text-xs text-neutral-500">Log in to view account details and orders.</p>
            </div>
          )}

          <div className="p-2">
            <button type="button" role="menuitem" onClick={showProfile} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-neutral-100">
              <ProfileIcon />
              {account ? 'Profile details' : 'Log in or create account'}
            </button>
            <button type="button" role="menuitem" onClick={showOrders} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-neutral-100">
              <OrdersIcon />
              Orders
            </button>
          </div>

          <nav className="border-t border-neutral-200 p-2" aria-label="Menu navigation">
            {menuLinks.map((link) => (
              <Link key={link.to} to={link.to} role="menuitem" className="block rounded-lg px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900">
                {link.label}
              </Link>
            ))}
          </nav>

          {account && (
            <div className="border-t border-neutral-200 p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void logout();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#E23744] hover:bg-red-50"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
      <path d="M5 6.5h14v13H5v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 4v4M16 4v4M8 12h8M8 15.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
