import { commerce } from '@/data/business';
import { formatPaiseCompact } from '@/lib/money';

export function AnnouncementBar() {
  return (
    <div className="bg-ink text-shell">
      <p className="mx-auto max-w-6xl px-5 py-2.5 text-center text-xs sm:px-8 sm:text-sm">
        Free shipping across India over{' '}
        {formatPaiseCompact(commerce.freeShippingThresholdInPaise)}
        <span className="mx-2 opacity-40" aria-hidden="true">
          •
        </span>
        Cash on Delivery available
      </p>
    </div>
  );
}
