import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useAccount } from '@/hooks/useAccount';
import { cn } from '@/lib/cn';

const navigation = [
  { to: '/shop', label: 'Shop' },
  { to: '/gifting', label: 'Gifting' },
  { to: '/story', label: 'Our story' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const { itemCount, openDrawer } = useCart();
  const { favoriteCount, openDrawer: openFavorites } = useFavorites();
  const { account, openDrawer: openAccount } = useAccount();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-shell/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5 sm:h-20 sm:px-8">
        <Link to="/" className="shrink-0" aria-label="Nuto — home">
          <img
            src="/nuto-wordmark.svg"
            alt="Nuto"
            className="h-7 w-auto sm:h-8"
            width={459}
            height={180}
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'text-sm transition-colors hover:text-cashew-deep',
                  isActive ? 'text-cashew-deep' : 'text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openFavorites}
            className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sand"
            aria-label={`Open favorites, ${favoriteCount} ${favoriteCount === 1 ? 'pack' : 'packs'}`}
          >
            <HeartIcon />
            {favoriteCount > 0 && (
              <span className="absolute top-1 right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-[#E23744] px-1 text-[10px] font-semibold text-white tabular-nums">
                {favoriteCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={openAccount}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sand"
            aria-label={account ? `Account details for ${account.name}` : 'Log in or create account'}
          >
            <AccountIcon />
          </button>

          <button
            type="button"
            onClick={openDrawer}
            className="relative flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sand"
            aria-label={`Open cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
          >
            <CartIcon />
            {itemCount > 0 && (
              <span className="absolute top-1 right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-cashew-deep px-1 text-[10px] font-semibold text-white tabular-nums">
                {itemCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-sand md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Primary mobile"
          className="border-t border-line bg-shell md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-5 py-2 sm:px-8">
            {navigation.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="block border-b border-line py-3.5 text-base last:border-b-0"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l-1 11H7L6 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 10V7a2.5 2.5 0 0 1 5 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
