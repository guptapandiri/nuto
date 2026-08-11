import { Link } from 'react-router';
import { flavours, packSizes, rupees } from '@/data/range';

const cards = [
  {
    path: '/concepts/roastery',
    label: 'Roastery',
    reference: 'Blue Tokai · Subko',
    swatches: ['#FBFAF7', '#2A2A28', '#A2632E'],
    pitch:
      'Specialist and restrained. The range reads as a considered list, and the pack-size selector is the primary control.',
    suits: 'A brand that wants to be taken seriously on quality.',
    tension: 'Quiet. Needs real photography and real process claims to carry it.',
  },
  {
    path: '/concepts/blocks',
    label: 'Flavour Blocks',
    reference: 'Omsom · Fly By Jing',
    swatches: ['#0E0E0F', '#A81E14', '#F4B860'],
    pitch:
      'Every flavour gets a saturated full-bleed band. Huge type, high contrast, built to be scrolled with a thumb.',
    suits: 'Instagram traffic, a younger buyer, and impulse ₹79 packs.',
    tension: 'Loud. Hard to sell a ₹3,000 wedding hamper in this voice.',
  },
  {
    path: '/concepts/gifting',
    label: 'Gifting House',
    reference: 'Bombay Sweet Shop · Fortnum',
    swatches: ['#FBF7EE', '#1F3B2C', '#B08542'],
    pitch:
      'Occasion-led. The hamper is the hero and loose jars are secondary. Deep green, cream, serif throughout.',
    suits: 'Festival and corporate volume, higher basket value.',
    tension: 'Justifies a premium price — which ₹1.50/g does not ask for.',
  },
] as const;

export function ConceptsIndex() {
  return (
    <div className="min-h-dvh bg-[#14161A] text-white">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
        <p className="text-[11px] tracking-[0.28em] text-white/40 uppercase">
          Nuto · design directions
        </p>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl">Three ways to build it</h1>
        <p className="mt-5 max-w-xl text-white/60">
          Each is a full homepage in a different voice, built on the proposed
          range — {flavours.length} flavours at{' '}
          {packSizes.map((size) => `${size.grams}g`).join(' / ')} for ₹
          {packSizes.map((size) => rupees(size.priceInPaise)).join(' / ')}. Your
          existing site is untouched at{' '}
          <Link to="/" className="underline underline-offset-4">
            /
          </Link>
          .
        </p>

        <ul className="mt-14 grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <li key={card.path}>
              <Link
                to={card.path}
                className="flex h-full flex-col rounded-xl border border-white/12 p-6 transition-colors hover:border-white/35 hover:bg-white/5"
              >
                <div className="flex gap-1.5">
                  {card.swatches.map((swatch) => (
                    <span
                      key={swatch}
                      className="size-6 rounded-full ring-1 ring-white/15"
                      style={{ backgroundColor: swatch }}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <h2 className="mt-6 font-display text-2xl">{card.label}</h2>
                <p className="mt-1 text-[12px] tracking-wide text-white/40">
                  {card.reference}
                </p>

                <p className="mt-4 flex-1 text-[14px] leading-relaxed text-white/70">
                  {card.pitch}
                </p>

                <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-[13px]">
                  <div>
                    <dt className="text-white/40">Suits</dt>
                    <dd className="mt-0.5 text-white/80">{card.suits}</dd>
                  </div>
                  <div>
                    <dt className="text-white/40">Tension</dt>
                    <dd className="mt-0.5 text-white/80">{card.tension}</dd>
                  </div>
                </dl>

                <span className="mt-6 text-[13px] underline underline-offset-4">
                  Open concept →
                </span>
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </div>
  );
}
