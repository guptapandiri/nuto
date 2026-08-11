import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { formatPaiseCompact } from '@/lib/money';
import { CartLineItem } from './CartLineItem';
import { ShippingProgress } from './ShippingProgress';

export function CartDrawer() {
  const {
    resolvedLines,
    subtotalInPaise,
    itemCount,
    setQuantity,
    removeItem,
    isDrawerOpen,
    closeDrawer,
  } = useCart();

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape, and lock body scroll while the drawer is open.
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
        aria-label="Close cart"
        className="absolute inset-0 h-full w-full cursor-default bg-ink/40"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-shell shadow-2xl focus:outline-none"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-lg font-semibold">
            Your cart{itemCount > 0 && ` (${itemCount})`}
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-sand"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {resolvedLines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="text-ink-soft">Your cart is empty.</p>
            <Button onClick={closeDrawer} variant="secondary">
              Keep browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <ul className="divide-y divide-line">
                {resolvedLines.map((line) => (
                  <CartLineItem
                    key={line.slug}
                    line={line}
                    compact
                    onQuantityChange={(quantity) => setQuantity(line.slug, quantity)}
                    onRemove={() => removeItem(line.slug)}
                  />
                ))}
              </ul>
            </div>

            <div className="space-y-4 border-t border-line px-5 py-5">
              <ShippingProgress subtotalInPaise={subtotalInPaise} />

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-ink-soft">Subtotal</span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatPaiseCompact(subtotalInPaise)}
                </span>
              </div>
              <p className="text-xs text-ink-muted">
                Shipping and any COD fee are calculated at checkout.
              </p>

              <div className="grid gap-2">
                <ButtonLink to="/checkout" size="lg" className="w-full">
                  Checkout
                </ButtonLink>
                <Link
                  to="/cart"
                  onClick={closeDrawer}
                  className="text-center text-sm text-ink-soft underline underline-offset-4 transition-colors hover:text-cashew-deep"
                >
                  View full cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
