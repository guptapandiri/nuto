import { cn } from '@/lib/cn';

/**
 * The green dot-in-a-square vegetarian mark. FSSAI requires this symbol on
 * vegetarian food products and their listings, so it appears on every card and
 * product page rather than being decorative.
 */
export function VegMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] border-[1.5px] border-success bg-white',
        className,
      )}
      role="img"
      aria-label="Vegetarian"
      title="Vegetarian"
    >
      <span className="size-2 rounded-full bg-success" />
    </span>
  );
}
