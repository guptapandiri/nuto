import { Link } from 'react-router';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { formatPaiseCompact } from '@/lib/money';
import type { ResolvedCartLine } from '@/types';

interface Props {
  line: ResolvedCartLine;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
  /** Compact layout for the slide-over drawer. */
  compact?: boolean;
}

export function CartLineItem({ line, onQuantityChange, onRemove, compact = false }: Props) {
  return (
    <li className="flex gap-4 py-4">
      <Link
        to={`/product/${line.slug}`}
        className="shrink-0 overflow-hidden rounded-lg bg-sand"
      >
        <img
          src={line.image}
          alt=""
          className={compact ? 'size-20 object-cover' : 'size-24 object-cover sm:size-28'}
          loading="lazy"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${line.slug}`}
              className="font-medium transition-colors hover:text-cashew-deep"
            >
              {line.name}
            </Link>
            <p className="mt-0.5 text-xs text-ink-muted">
              {line.weightGrams}g &middot; {formatPaiseCompact(line.unitPriceInPaise)} each
            </p>
          </div>
          <p className="shrink-0 font-medium tabular-nums">
            {formatPaiseCompact(line.lineTotalInPaise)}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-3 pt-3">
          <QuantityStepper
            quantity={line.quantity}
            onChange={onQuantityChange}
            itemLabel={line.name}
            allowRemove
          />
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-ink-muted underline underline-offset-2 transition-colors hover:text-danger"
          >
            Remove
          </button>
        </div>
      </div>
    </li>
  );
}
