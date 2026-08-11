import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

interface Props {
  title: string;
  subtitle?: string;
  /** Optional "see all" target shown next to the heading. */
  viewAll?: { to: string; label: string };
  /** Each child becomes one snap point. */
  children: React.ReactNode;
  /** Tailwind width classes for each item. Tune per rail. */
  itemClassName?: string;
  className?: string;
}

/**
 * Horizontal rail with scroll snapping.
 *
 * Native scrolling does the work — so touch, trackpad and screen-reader
 * navigation all behave normally — and the arrows are a progressive
 * enhancement layered on top for mouse users. Arrows disable at the ends
 * rather than disappearing, so the control does not jump around.
 */
export function Carousel({
  title,
  subtitle,
  viewAll,
  children,
  itemClassName = 'w-[15rem] sm:w-[17rem]',
  className,
}: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setOverflows(max > 4);
    setAtStart(track.scrollLeft <= 4);
    setAtEnd(track.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    sync();
    const track = trackRef.current;
    if (!track) return;

    // Re-check when the container resizes — a rail that overflows on mobile
    // may fit on desktop, and the arrows should disappear when it does.
    const observer = new ResizeObserver(sync);
    observer.observe(track);
    return () => observer.disconnect();
  }, [sync, children]);

  function scrollBy(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  }

  return (
    <section className={cn('mx-auto max-w-7xl px-4', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-[13px] text-neutral-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {viewAll && (
            <Link
              to={viewAll.to}
              className="text-[13px] font-semibold text-[#1B7A4B] underline-offset-4 hover:underline"
            >
              {viewAll.label}
            </Link>
          )}
          {overflows && (
            <div className="hidden gap-1.5 sm:flex">
              <ArrowButton
                direction="left"
                disabled={atStart}
                onClick={() => scrollBy(-1)}
                label={`Scroll ${title} left`}
              />
              <ArrowButton
                direction="right"
                disabled={atEnd}
                onClick={() => scrollBy(1)}
                label={`Scroll ${title} right`}
              />
            </div>
          )}
        </div>
      </div>

      <ul
        ref={trackRef}
        onScroll={sync}
        // -mx-4 px-4 lets items bleed to the screen edge on mobile while the
        // first one still lines up with the page gutter. scroll-pl-4 insets the
        // snapport to match that padding — without it the rail rests at
        // scrollLeft 16 rather than 0, and "at start" never registers.
        className="-mx-4 mt-4 flex snap-x snap-mandatory scroll-pl-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {Array.isArray(children)
          ? children.map((child, index) => (
              <li key={index} className={cn('shrink-0 snap-start', itemClassName)}>
                {child}
              </li>
            ))
          : children}
      </ul>
    </section>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 transition-colors hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-neutral-300"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
        <path
          d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
