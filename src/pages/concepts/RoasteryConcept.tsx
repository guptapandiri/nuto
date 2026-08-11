import { useState } from 'react';
import { ConceptFrame } from './ConceptFrame';
import { flavours, packSizes, rupees } from '@/data/range';

/**
 * Concept A — "Roastery".
 * Reference: Blue Tokai, Subko.
 *
 * Specialist and restrained. Off-white, generous air, serif display, hairline
 * rules. The range reads as a considered list rather than a grid of cards, and
 * the size selector is the primary interaction — the thing Blue Tokai does well
 * and the thing this catalogue actually needs.
 */
export function RoasteryConcept() {
  const [sizeIndex, setSizeIndex] = useState(1); // default to 100g
  const size = packSizes[sizeIndex] ?? packSizes[0]!;

  return (
    <ConceptFrame
      id="roastery"
      background="#FBFAF7"
      color="#2A2A28"
      accent="#A2632E"
    >
      {/* Masthead */}
      <header className="border-b border-[#E4DFD6]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <img src="/nuto-wordmark.svg" alt="Nuto" className="h-6 w-auto" />
          <nav className="hidden gap-8 text-[13px] tracking-wide sm:flex">
            <span>The Range</span>
            <span>Roasting</span>
            <span>Stockists</span>
          </nav>
          <span className="text-[13px] tracking-wide">Cart (0)</span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 pt-20 pb-16 sm:pt-28">
        <p className="text-[11px] tracking-[0.28em] text-[#A2632E] uppercase">
          Hyderabad · Est. 2026
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.5rem,7vw,4.75rem)] leading-[1.02] font-normal">
          Eight seasonings.
          <br />
          <span className="italic">One cashew</span> worth seasoning.
        </h1>
        <p className="mt-8 max-w-md text-[15px] leading-relaxed text-[#6A675F]">
          We roast in small batches and season by hand. Choose a flavour, choose
          a size — everything ships sealed from our kitchen within two days.
        </p>
      </section>

      {/* Size selector — the primary control */}
      <section className="border-y border-[#E4DFD6] bg-[#F4F1EA]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-6 py-6">
          <span className="text-[11px] tracking-[0.22em] text-[#6A675F] uppercase">
            Pack size
          </span>
          <div className="flex gap-2">
            {packSizes.map((option, index) => {
              const active = index === sizeIndex;
              return (
                <button
                  key={option.grams}
                  type="button"
                  onClick={() => setSizeIndex(index)}
                  aria-pressed={active}
                  className={`rounded-full border px-5 py-2 text-[13px] transition-colors ${
                    active
                      ? 'border-[#2A2A28] bg-[#2A2A28] text-[#FBFAF7]'
                      : 'border-[#D6CFC2] hover:border-[#2A2A28]'
                  }`}
                >
                  {option.grams}g
                </button>
              );
            })}
          </div>
          <span className="ml-auto font-display text-xl">
            ₹{rupees(size.priceInPaise)}
            <span className="ml-2 text-[13px] text-[#6A675F]">
              per jar · ₹{(size.priceInPaise / 100 / size.grams).toFixed(2)}/g
            </span>
          </span>
        </div>
      </section>

      {/* The range, as a list */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-display text-2xl">The range</h2>

        <ul className="mt-10 divide-y divide-[#E4DFD6] border-y border-[#E4DFD6]">
          {flavours.map((flavour, index) => (
            <li
              key={flavour.slug}
              className="group grid grid-cols-[2rem_1fr_auto] items-baseline gap-x-5 py-6 sm:grid-cols-[3rem_14rem_1fr_auto] sm:gap-x-8"
            >
              <span className="font-display text-[13px] text-[#A79F92] tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>

              <div className="col-span-1">
                <h3 className="flex items-center gap-2.5 font-display text-xl">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: flavour.accent }}
                    aria-hidden="true"
                  />
                  {flavour.name}
                </h3>
                <p className="mt-1 text-[13px] text-[#6A675F] sm:hidden">
                  {flavour.note}
                </p>
              </div>

              <p className="col-span-3 hidden text-[14px] text-[#6A675F] sm:col-span-1 sm:block">
                {flavour.blurb}
              </p>

              <div className="col-start-3 flex items-center gap-5 sm:col-start-4">
                <span className="font-display text-lg tabular-nums">
                  ₹{rupees(size.priceInPaise)}
                </span>
                <button
                  type="button"
                  className="rounded-full border border-[#D6CFC2] px-4 py-1.5 text-[12px] transition-colors group-hover:border-[#2A2A28] group-hover:bg-[#2A2A28] group-hover:text-[#FBFAF7]"
                >
                  Add
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Editorial band */}
      <section className="border-t border-[#E4DFD6] bg-[#F4F1EA]">
        <div className="mx-auto grid max-w-5xl gap-12 px-6 py-20 sm:grid-cols-2 sm:items-center">
          <img
            src="/combos/seven-pack-lineup.png"
            alt="The Nuto range"
            className="w-full rounded-sm object-cover"
            loading="lazy"
          />
          <div>
            <p className="text-[11px] tracking-[0.28em] text-[#A2632E] uppercase">
              On roasting
            </p>
            <h2 className="mt-5 font-display text-3xl leading-tight">
              Season last, not first.
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#6A675F]">
              Most flavoured nuts are tumbled in seasoning before roasting, which
              burns the spice and leaves the nut underneath doing very little. We
              roast first, season after, in batches small enough to taste as we
              go.
            </p>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-6 py-14 text-[13px] text-[#A79F92]">
        <img
          src="/nuto-logo.svg"
          alt="Nuto — Flavor in every fold"
          className="h-12 w-auto"
        />
        <p className="mt-6">Hyderabad, India · +91 99495 04441</p>
      </footer>
    </ConceptFrame>
  );
}
