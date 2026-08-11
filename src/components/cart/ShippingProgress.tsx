import { commerce } from '@/data/business';
import { formatPaiseCompact } from '@/lib/money';

/** Nudges the basket towards the free-shipping threshold. */
export function ShippingProgress({ subtotalInPaise }: { subtotalInPaise: number }) {
  const threshold = commerce.freeShippingThresholdInPaise;
  const shortfall = Math.max(0, threshold - subtotalInPaise);
  const percent = Math.min(100, Math.round((subtotalInPaise / threshold) * 100));
  const unlocked = shortfall === 0;

  return (
    <div>
      <p className="text-xs text-ink-soft">
        {unlocked ? (
          <span className="font-medium text-success">
            Free shipping unlocked on this order.
          </span>
        ) : (
          <>
            Add <strong className="font-semibold">{formatPaiseCompact(shortfall)}</strong>{' '}
            more for free shipping.
          </>
        )}
      </p>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand-deep"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress towards free shipping"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            unlocked ? 'bg-success' : 'bg-cashew'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
