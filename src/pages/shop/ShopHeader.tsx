import { useState } from 'react';
import { Link } from 'react-router';
import { flavours } from '@/data/range';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { CustomerMenu } from '@/components/account/CustomerMenu';
import { PromotionBar } from '@/components/promotions/PromotionBar';

const offers = [
  'FREE shipping on orders above ₹499',
  'Extra 10% OFF on prepaid orders — code PREPAID10',
  'Buy any 3 packs, get 1 FREE',
];

export function OfferStrip() {
  return <PromotionBar
    fallbacks={offers}
    className="bg-[#1B7A4B] text-white"
    contentClassName="mx-auto max-w-7xl px-4 py-2 text-center text-[12px] font-medium sm:text-[13px]"
  />;
}

export function ShopHeader({
  query,
  onQueryChange,
  onQuerySubmit,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onQuerySubmit: () => void;
}) {
  const { itemCount, openDrawer } = useCart();
  const { favoriteCount, openDrawer: openFavorites } = useFavorites();
  const [isSuggestionsOpen, setSuggestionsOpen] = useState(false);
  const needle = query.trim().toLowerCase();
  const suggestions = needle
    ? flavours
        .filter((flavour) =>
          `${flavour.name} ${flavour.note} ${flavour.blurb}`.toLowerCase().includes(needle),
        )
        .slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <Link to="/shop-v2" className="shrink-0">
          <img src="/nuto-wordmark.svg" alt="Nuto" className="h-7 w-auto sm:h-8" />
        </Link>

        <nav className="hidden shrink-0 items-center gap-4 text-[13px] font-medium text-neutral-600 xl:flex" aria-label="Main navigation">
          <Link to="/shop" className="hover:text-[#1B7A4B]">Shop</Link>
          <Link to="/gifting" className="hover:text-[#1B7A4B]">Gifting</Link>
          <Link to="/story" className="hover:text-[#1B7A4B]">Our story</Link>
          <Link to="/contact" className="hover:text-[#1B7A4B]">Contact</Link>
        </nav>

        <form
          className="relative flex-1"
          onSubmit={(event) => {
            event.preventDefault();
            setSuggestionsOpen(false);
            onQuerySubmit();
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
            <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              onQueryChange(event.target.value);
              setSuggestionsOpen(true);
            }}
            onFocus={() => setSuggestionsOpen(true)}
            onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
            placeholder="Search for chilli, masala, peri peri…"
            aria-label="Search flavours"
            className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-2.5 pr-10 pl-9 text-[16px] placeholder:text-neutral-400 focus:border-[#1B7A4B] focus:bg-white focus:outline-none sm:text-[14px]"
          />
          <button
            type="submit"
            aria-label="Show search results"
            className="absolute top-1/2 right-1.5 grid size-8 -translate-y-1/2 place-items-center rounded-md text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {isSuggestionsOpen && needle && (
            <div
              className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl"
              role="listbox"
              aria-label="Search suggestions"
            >
              {suggestions.length > 0 ? (
                <>
                  <p className="px-3 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-neutral-500 uppercase">
                    Flavours
                  </p>
                  <ul className="pb-1">
                    {suggestions.map((flavour) => (
                      <li key={flavour.slug}>
                        <Link
                          to={`/p/${flavour.slug}`}
                          role="option"
                          className="flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-50"
                        >
                          <img
                            src={flavour.image}
                            alt=""
                            className="size-10 rounded-lg object-cover"
                          />
                          <span className="min-w-0">
                            <span className="block text-[14px] font-semibold text-neutral-900">
                              {flavour.name}
                            </span>
                            <span className="block truncate text-[12px] text-neutral-500">
                              {flavour.note}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="px-3 py-3 text-[13px] text-neutral-500">No flavour matches yet.</p>
              )}
              <button
                type="submit"
                className="flex w-full items-center justify-between border-t border-neutral-200 px-3 py-3 text-left text-[13px] font-semibold text-[#1B7A4B] hover:bg-[#1B7A4B]/5"
              >
                <span>View all results for “{query.trim()}”</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          )}
        </form>

        <button
          type="button"
          onClick={openFavorites}
          className="relative flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-[13px] font-medium hover:border-[#E23744] hover:text-[#E23744]"
          aria-label={`Favorites, ${favoriteCount} packs`}
        >
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Favorites</span>
          {favoriteCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[#E23744] text-[11px] font-bold text-white tabular-nums">
              {favoriteCount}
            </span>
          )}
        </button>

        <CustomerMenu />

        <button
          type="button"
          onClick={openDrawer}
          className="relative flex shrink-0 items-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-[13px] font-medium hover:border-neutral-900"
          aria-label={`Cart, ${itemCount} items`}
        >
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" aria-hidden="true">
            <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M9.5 10V7a2.5 2.5 0 0 1 5 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Cart</span>
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-[#E23744] text-[11px] font-bold text-white tabular-nums">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
