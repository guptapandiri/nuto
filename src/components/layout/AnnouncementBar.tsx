import { commerce } from '@/data/business';
import { formatPaiseCompact } from '@/lib/money';
import { PromotionBar } from '@/components/promotions/PromotionBar';

export function AnnouncementBar() {
  return <PromotionBar
    fallbacks={[`Free shipping across India over ${formatPaiseCompact(commerce.freeShippingThresholdInPaise)} · Cash on Delivery available`]}
    className="bg-ink text-shell"
    contentClassName="mx-auto max-w-6xl px-5 py-2.5 text-center text-xs sm:px-8 sm:text-sm"
  />;
}
