import { Link } from 'react-router';
import { VegMark } from '@/components/ui/VegMark';
import { useCart } from '@/hooks/useCart';
import { discountPercent, formatPaiseCompact } from '@/lib/money';
import type { Product } from '@/types';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const discount = discountPercent(product.priceInPaise, product.mrpInPaise);

  return (
    <article className="group flex flex-col">
      <Link
        to={`/product/${product.slug}`}
        className="relative block overflow-hidden rounded-card bg-sand"
        // The accent tint sits behind the jar photograph on hover.
        style={{ ['--accent' as string]: `var(${product.accentVar})` }}
      >
        <img
          src={product.image}
          alt={`Nuto ${product.name} — ${product.tagline} cashews, ${product.weightGrams}g jar`}
          className="aspect-[2/3] w-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
          loading="lazy"
          width={720}
          height={1080}
        />
        {discount > 0 && (
          <span className="absolute top-3 left-3 rounded-full bg-ink px-2.5 py-1 text-[11px] font-semibold text-shell">
            {discount}% off
          </span>
        )}
        {!product.inStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-xs font-medium text-shell">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold">
              <Link
                to={`/product/${product.slug}`}
                className="transition-colors hover:text-cashew-deep"
              >
                {product.name}
              </Link>
              <VegMark />
            </h3>
            <p className="mt-0.5 text-sm text-ink-soft">{product.tagline}</p>
          </div>
          <span
            className="mt-1 shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style={{ backgroundColor: `var(${product.accentVar})` }}
          >
            {product.weightGrams}g
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-semibold tabular-nums">
            {formatPaiseCompact(product.priceInPaise)}
          </span>
          {product.mrpInPaise && (
            <span className="text-sm text-ink-muted line-through tabular-nums">
              {formatPaiseCompact(product.mrpInPaise)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => addItem(product.slug)}
          disabled={!product.inStock}
          className="mt-4 w-full rounded-full border border-ink/20 py-2.5 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-shell disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink"
        >
          {product.inStock ? 'Add to cart' : 'Sold out'}
        </button>
      </div>
    </article>
  );
}
