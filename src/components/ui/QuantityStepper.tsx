import { commerce } from '@/data/business';

interface Props {
  quantity: number;
  onChange: (quantity: number) => void;
  /** Label for screen readers, e.g. the product name this stepper controls. */
  itemLabel: string;
  /** When true, stepping below 1 removes the line instead of clamping at 1. */
  allowRemove?: boolean;
}

export function QuantityStepper({
  quantity,
  onChange,
  itemLabel,
  allowRemove = false,
}: Props) {
  const min = allowRemove ? 0 : 1;
  const canDecrease = quantity > min;
  const canIncrease = quantity < commerce.maxQuantityPerLine;

  return (
    <div className="inline-flex items-center rounded-full border border-line">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={!canDecrease}
        aria-label={`Decrease quantity of ${itemLabel}`}
        className="flex size-9 items-center justify-center rounded-full text-lg leading-none text-ink transition-colors hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent"
      >
        &minus;
      </button>
      <span
        className="min-w-8 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
        aria-label={`Quantity of ${itemLabel}`}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={!canIncrease}
        aria-label={`Increase quantity of ${itemLabel}`}
        className="flex size-9 items-center justify-center rounded-full text-lg leading-none text-ink transition-colors hover:bg-sand disabled:opacity-30 disabled:hover:bg-transparent"
      >
        +
      </button>
    </div>
  );
}
