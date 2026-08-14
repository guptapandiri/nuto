import { Link, NavLink } from 'react-router';
import { CustomerMenu } from '@/components/account/CustomerMenu';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
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

          <CustomerMenu compact />

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
        </div>
      </div>
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
