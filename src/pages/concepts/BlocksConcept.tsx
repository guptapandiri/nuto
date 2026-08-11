import { useState } from 'react';
import { ConceptFrame } from './ConceptFrame';
import { flavours, packSizes, rupees, type HeatLevel } from '@/data/range';

/**
 * Concept B — "Flavour Blocks".
 * Reference: Omsom, Fly By Jing.
 *
 * Each flavour owns a saturated full-bleed band. Huge tight-tracked type, high
 * contrast, sticky flavour nav. Built to be scrolled with a thumb — which is
 * where the traffic actually comes from, since Instagram is the only channel.
 */
export function BlocksConcept() {
  const [sizeIndex, setSizeIndex] = useState(1);
  const size = packSizes[sizeIndex] ?? packSizes[0]!;

  return (
    <ConceptFrame id="blocks" background="#0E0E0F" color="#F5F2EC" accent="#F4B860">
      {/* Masthead */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <img
            src="/nuto-wordmark.svg"
            alt="Nuto"
            className="h-6 w-auto brightness-0 invert"
          />
          <span className="text-[13px] font-semibold tracking-wider uppercase">
            Bag · 0
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-14 sm:pt-24">
        <h1 className="text-[clamp(3rem,13vw,9rem)] leading-[0.85] font-black tracking-[-0.045em] uppercase">
          Eight
          <br />
          <span className="text-[#F4B860]">ways</span> to
          <br />
          ruin a
          <br />
          cashew.
        </h1>
        <p className="mt-9 max-w-sm text-lg leading-snug text-white/65">
          In the good way. Pick your damage — from{' '}
          <span className="text-white">Salted</span> (coward) to{' '}
          <span className="text-[#F4B860]">Peri Peri</span> (unwise).
        </p>

        {/* Size toggle */}
        <div className="mt-10 inline-flex rounded-full border border-white/20 p-1">
          {packSizes.map((option, index) => (
            <button
              key={option.grams}
              type="button"
              onClick={() => setSizeIndex(index)}
              aria-pressed={index === sizeIndex}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
                index === sizeIndex ? 'bg-[#F4B860] text-[#0E0E0F]' : 'text-white/70'
              }`}
            >
              {option.grams}g
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-white/50">
          ₹{rupees(size.priceInPaise)} a jar, whichever flavour you pick.
        </p>
      </section>

      {/* Flavour bands */}
      {flavours.map((flavour, index) => (
        <section
          key={flavour.slug}
          style={{ backgroundColor: flavour.accent }}
          className="text-white"
        >
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-10 sm:py-16">
            <span className="text-sm font-black tabular-nums opacity-45">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div>
              <h2 className="text-[clamp(2rem,6.5vw,3.75rem)] leading-[0.9] font-black tracking-[-0.035em] uppercase">
                {flavour.name}
              </h2>
              <p className="mt-3 max-w-md text-[15px] leading-snug text-white/85">
                {flavour.blurb}
              </p>
              <HeatMeter level={flavour.heat} />
            </div>

            <button
              type="button"
              className="justify-self-start rounded-full bg-white px-7 py-3.5 text-sm font-black tracking-wide text-[#0E0E0F] uppercase transition-transform hover:scale-105 sm:justify-self-end"
              style={{ color: flavour.accent }}
            >
              Add · ₹{rupees(size.priceInPaise)}
            </button>
          </div>
        </section>
      ))}

      {/* Closer */}
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <h2 className="text-[clamp(2rem,7vw,4rem)] leading-[0.9] font-black tracking-[-0.04em] uppercase">
          Can&apos;t decide?
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-white/65">
          Take all eight in 50g. It costs ₹{rupees(packSizes[0]!.priceInPaise * 8)} and
          settles every argument.
        </p>
        <button
          type="button"
          className="mt-8 rounded-full bg-[#F4B860] px-9 py-4 text-sm font-black tracking-wide text-[#0E0E0F] uppercase"
        >
          Build the box
        </button>
      </section>

      <footer className="border-t border-white/10 px-5 py-10 text-center text-[13px] text-white/40">
        Nuto · Hyderabad · +91 99495 04441
      </footer>
    </ConceptFrame>
  );
}

function HeatMeter({ level }: { level: HeatLevel }) {
  if (level === 0) {
    return <p className="mt-4 text-[11px] font-bold tracking-[0.2em] uppercase opacity-70">No heat</p>;
  }
  return (
    <p className="mt-4 flex items-center gap-1.5" aria-label={`Heat level ${level} of 3`}>
      <span className="mr-1 text-[11px] font-bold tracking-[0.2em] uppercase opacity-70">
        Heat
      </span>
      {[1, 2, 3].map((step) => (
        <span
          key={step}
          aria-hidden="true"
          className={`h-1.5 w-6 rounded-full ${step <= level ? 'bg-white' : 'bg-white/25'}`}
        />
      ))}
    </p>
  );
}
