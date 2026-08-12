import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { getCatalogueItemPath } from '@/data/catalogue';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import { formatPaiseCompact } from '@/lib/money';

export function FavoritesDrawer() {
  const {
    favoriteItems,
    favoriteCount,
    removeFavorite,
    isDrawerOpen,
    closeDrawer,
  } = useFavorites();
  const { addItem } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        onClick={closeDrawer}
        aria-label="Close favorites"
        className="absolute inset-0 h-full w-full cursor-default bg-neutral-900/40"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Favorite packs"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="text-lg font-bold">
            Favorites{favoriteCount > 0 && ` (${favoriteCount})`}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close favorites"
            className="grid size-9 place-items-center rounded-full hover:bg-neutral-100"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {favoriteItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <svg viewBox="0 0 24 24" className="size-10 text-neutral-300" fill="none" aria-hidden="true">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <p className="font-semibold">No favorite packs yet</p>
            <p className="text-sm text-neutral-500">Tap the heart on any pack to save it here.</p>
            <button type="button" onClick={closeDrawer} className="mt-2 text-sm font-semibold text-[#1B7A4B] underline underline-offset-4">
              Browse packs
            </button>
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto px-5">
            {favoriteItems.map((item) => (
              <li key={item.slug} className="flex gap-3 py-4">
                <Link to={getCatalogueItemPath(item.slug)} onClick={closeDrawer} className="shrink-0">
                  <img src={item.image} alt="" className="size-20 rounded-lg bg-neutral-50 object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={getCatalogueItemPath(item.slug)} onClick={closeDrawer} className="font-semibold hover:text-[#1B7A4B]">
                    {item.name}
                  </Link>
                  <p className="mt-1 text-sm font-bold tabular-nums">{formatPaiseCompact(item.priceInPaise)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeDrawer();
                        addItem(item.slug);
                      }}
                      disabled={!item.inStock}
                      className="rounded-lg bg-[#1B7A4B] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-neutral-300"
                    >
                      {item.inStock ? 'ADD TO CART' : 'SOLD OUT'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFavorite(item.slug)}
                      className="px-2 py-2 text-xs font-semibold text-neutral-500 hover:text-[#E23744]"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
