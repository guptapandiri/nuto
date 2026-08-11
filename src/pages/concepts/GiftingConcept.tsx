import { ConceptFrame } from './ConceptFrame';
import { flavours, packSizes, rupees } from '@/data/range';

/**
 * Concept C — "Gifting House".
 * Reference: Bombay Sweet Shop, Fortnum & Mason.
 *
 * Occasion-led rather than product-led. The hamper is the hero and the loose
 * jars are secondary. Deep green and cream, serif throughout, ornamental rules.
 * This is the direction that justifies a premium price — and the one that most
 * contradicts ₹1.50/g pricing.
 */

const INK = '#1F3B2C';
const CREAM = '#FBF7EE';
const GOLD = '#B08542';

/** Hamper pricing is derived from real pack prices so the maths is checkable. */
const hampers = [
  {
    name: 'The Eight',
    occasion: 'Diwali · Weddings',
    contents: 'All eight flavours, 100g each',
    priceInPaise: packSizes[1]!.priceInPaise * 8,
    note: 'The one you send when you do not know their taste.',
    /* Only one photograph exists, so each card frames a different part of it. */
    focus: '18% 50%',
  },
  {
    name: 'The Tasting Box',
    occasion: 'Thank you · Housewarming',
    contents: 'All eight flavours, 50g each',
    priceInPaise: packSizes[0]!.priceInPaise * 8,
    note: 'Small, complete, and impossible to get wrong.',
    focus: '50% 50%',
  },
  {
    name: 'The Heat Box',
    occasion: 'For the one who complains',
    contents: 'Chilli, Peri Peri, Sweet Chilli, Lemon Chilli — 200g each',
    priceInPaise: packSizes[2]!.priceInPaise * 4,
    note: 'For the relative who says everything is too mild.',
    focus: '85% 50%',
  },
];

export function GiftingConcept() {
  return (
    <ConceptFrame id="gifting" background={CREAM} color={INK} accent={GOLD}>
      {/* Masthead */}
      <header style={{ borderColor: `${INK}1A` }} className="border-b">
        <div className="mx-auto max-w-5xl px-6 py-6 text-center">
          <img src="/nuto-logo.svg" alt="Nuto" className="mx-auto h-14 w-auto" />
          <nav className="mt-5 flex justify-center gap-8 text-[12px] tracking-[0.16em] uppercase">
            <span>Hampers</span>
            <span>The Range</span>
            <span>Corporate</span>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ backgroundColor: INK, color: CREAM }}>
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <Ornament color={GOLD} />
          <h1 className="mt-7 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.08]">
            The season of
            <br />
            <span className="italic" style={{ color: GOLD }}>
              giving well
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed opacity-75">
            Hampers of hand-seasoned cashews, boxed and sealed in Hyderabad.
            Dispatched nationwide in time for Diwali, Ugadi, Eid and the wedding
            season.
          </p>
          <button
            type="button"
            className="mt-9 rounded-sm px-8 py-3.5 text-[12px] tracking-[0.18em] uppercase"
            style={{ backgroundColor: GOLD, color: INK }}
          >
            Shop hampers
          </button>
        </div>
      </section>

      {/* Hampers */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <Ornament color={GOLD} />
          <h2 className="mt-5 font-display text-3xl">Our hampers</h2>
        </div>

        <ul className="mt-14 grid gap-10 sm:grid-cols-3">
          {hampers.map((hamper) => (
            <li key={hamper.name} className="flex flex-col text-center">
              <div
                className="aspect-[4/5] overflow-hidden rounded-sm"
                style={{ border: `1px solid ${INK}1A` }}
              >
                <img
                  src="/combos/seven-pack-lineup.png"
                  alt={hamper.name}
                  className="size-full object-cover"
                  style={{ objectPosition: hamper.focus }}
                  loading="lazy"
                />
              </div>
              <p
                className="mt-6 text-[11px] tracking-[0.2em] uppercase"
                style={{ color: GOLD }}
              >
                {hamper.occasion}
              </p>
              <h3 className="mt-2 font-display text-2xl">{hamper.name}</h3>
              <p className="mt-2 text-[13px] opacity-65">{hamper.contents}</p>
              <p className="mt-3 flex-1 text-[13px] italic opacity-55">{hamper.note}</p>
              <p className="mt-5 font-display text-xl">₹{rupees(hamper.priceInPaise)}</p>
              <button
                type="button"
                className="mt-4 rounded-sm border py-2.5 text-[12px] tracking-[0.16em] uppercase transition-colors hover:bg-[#1F3B2C] hover:text-[#FBF7EE]"
                style={{ borderColor: `${INK}33` }}
              >
                Add to basket
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* The range, understated */}
      <section style={{ borderColor: `${INK}1A` }} className="border-y">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="text-center">
            <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: GOLD }}>
              Or build your own
            </p>
            <h2 className="mt-4 font-display text-3xl">Eight seasonings</h2>
            <p className="mx-auto mt-4 max-w-md text-[14px] opacity-65">
              Available loose in 50g, 100g and 200g — from ₹
              {rupees(packSizes[0]!.priceInPaise)}.
            </p>
          </div>

          <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4">
            {flavours.map((flavour) => (
              <li
                key={flavour.slug}
                className="flex items-center gap-3 border-b pb-3 text-[14px]"
                style={{ borderColor: `${INK}14` }}
              >
                <span
                  className="size-2 shrink-0 rotate-45"
                  style={{ backgroundColor: flavour.accent }}
                  aria-hidden="true"
                />
                {flavour.name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Corporate */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Ornament color={GOLD} />
        <h2 className="mt-5 font-display text-3xl">Corporate gifting</h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed opacity-70">
          Custom boxes, printed cards and your logo on the sleeve. Tell us your
          headcount and the date, and we will handle the rest.
        </p>
        <p className="mt-7 text-[13px]" style={{ color: GOLD }}>
          +91 99495 04441
        </p>
      </section>

      {/* Opacity goes on the text, not the element — otherwise the deep green
          background washes out with it. */}
      <footer style={{ backgroundColor: INK }} className="px-6 py-12 text-center">
        <span className="text-[12px]" style={{ color: CREAM, opacity: 0.7 }}>
          Nuto · Hyderabad, India · Flavor in every fold
        </span>
      </footer>
    </ConceptFrame>
  );
}

function Ornament({ color }: { color: string }) {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden="true">
      <span className="h-px w-10" style={{ backgroundColor: color, opacity: 0.5 }} />
      <span className="size-1.5 rotate-45" style={{ backgroundColor: color }} />
      <span className="h-px w-10" style={{ backgroundColor: color, opacity: 0.5 }} />
    </div>
  );
}
