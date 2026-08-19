import { useEffect, useMemo, useState } from 'react';
import { apiUrl } from '@/lib/api';

interface PublicPromotion {
  id: string;
  kind: 'product_launch' | 'offer' | 'announcement';
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaUrl: string | null;
}

export function PromotionBar({
  fallbacks,
  className,
  contentClassName,
}: {
  fallbacks: string[];
  className: string;
  contentClassName: string;
}) {
  const [promotions, setPromotions] = useState<PublicPromotion[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    fetch(apiUrl('/api/promotions'))
      .then(async (response) => {
        if (!response.ok) throw new Error('unavailable');
        return response.json() as Promise<{ promotions: PublicPromotion[] }>;
      })
      .then((result) => {
        if (active) setPromotions(result.promotions);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const items = useMemo<PublicPromotion[]>(
    () => promotions.length > 0
      ? promotions
      : fallbacks.map((message, fallbackIndex) => ({
          id: `fallback-${fallbackIndex}`,
          kind: 'announcement',
          title: '',
          message,
          ctaLabel: null,
          ctaUrl: null,
        })),
    [promotions, fallbacks],
  );

  useEffect(() => {
    setIndex(0);
    if (items.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % items.length), 5000);
    return () => window.clearInterval(timer);
  }, [items]);

  const item = items[index] ?? items[0];
  if (!item) return null;

  return (
    <div className={className} data-promotion-kind={item.kind}>
      <p className={contentClassName}>
        {item.title && <strong className="mr-1.5">{item.title}</strong>}
        {item.message}
        {item.ctaLabel && item.ctaUrl && (
          <a href={item.ctaUrl} className="ml-2 font-bold underline underline-offset-2">
            {item.ctaLabel} →
          </a>
        )}
      </p>
    </div>
  );
}
