import { Link } from 'react-router';
import { ProductGrid } from '@/components/product/ProductGrid';
import { ButtonLink } from '@/components/ui/Button';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { business } from '@/data/business';
import { giftBoxes } from '@/data/giftBoxes';
import { products } from '@/data/products';
import { formatPaiseCompact } from '@/lib/money';

export function HomePage() {
  return (
    <>
      <Hero />
      <TheRange />
      <WhyNuto />
      <GiftingTeaser />
    </>
  );
}

function Hero() {
  return (
    <section className="border-b border-line bg-sand">
      <Container className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-cashew-deep uppercase">
            Roasted in {business.city}
          </p>
          <h1 className="mt-4 text-4xl leading-[1.05] font-semibold sm:text-5xl lg:text-6xl">
            Cashews worth
            <br />
            slowing down for.
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">
            Six flavours, whole W240 cashews, and nothing in the jar that has no business
            being there. Made for hosting, gifting, and the good half hour before dinner.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink to="/shop" size="lg">
              Shop the range
            </ButtonLink>
            <ButtonLink to="/gifting" variant="secondary" size="lg">
              Gifting
            </ButtonLink>
          </div>
        </div>

        <div className="overflow-hidden rounded-card">
          <img
            src="/combos/seven-pack-lineup.png"
            alt="All five Nuto cashew jars — Original, Fire, Velvet, Zest and Smoke — lined up with their spice blends"
            className="w-full object-cover"
            width={1600}
            height={830}
            fetchPriority="high"
          />
        </div>
      </Container>
    </section>
  );
}

function TheRange() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="The range"
          title="Six flavours, no filler"
          description="Start with Original if you want to understand the nut. Start with Fire if you already know what you like."
        />
        <div className="mt-12">
          <ProductGrid products={products} />
        </div>
      </Container>
    </Section>
  );
}

const reasons = [
  {
    title: 'Whole W240 grade',
    body: 'The large, unbroken grade — not the split pieces that get hidden under seasoning. You can see them through the window on every jar.',
  },
  {
    title: 'Roasted, not fried',
    body: 'Dry-roasted in small batches so the flavour comes from the nut and the spice, rather than from oil.',
  },
  {
    title: 'Sealed for the shelf',
    body: 'Every jar is sealed to stay crisp from our kitchen to your table, and shipped across India in protective packaging.',
  },
];

function WhyNuto() {
  return (
    <Section className="border-y border-line bg-sand">
      <Container>
        <SectionHeading eyebrow="Why Nuto" title="Made properly, or not at all" />
        <dl className="mt-12 grid gap-8 sm:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title}>
              <dt className="font-display text-lg font-semibold">{reason.title}</dt>
              <dd className="mt-2 text-ink-soft">{reason.body}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}

function GiftingTeaser() {
  const [featured] = giftBoxes;
  if (!featured) return null;

  return (
    <Section>
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 overflow-hidden rounded-card lg:order-1">
          <img
            src={featured.image}
            alt={`The ${featured.name} gift box`}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="order-1 lg:order-2">
          <SectionHeading
            eyebrow="Gifting"
            title="For the occasions that keep coming"
            description="Diwali, Ugadi, Eid, weddings, and the colleague whose last day is tomorrow. Boxed, sealed and ready to hand over."
          />
          <p className="mt-6 text-ink-soft">
            <strong className="font-semibold text-ink">{featured.name}</strong> —{' '}
            {featured.description}
          </p>
          <p className="mt-3 text-lg font-semibold tabular-nums">
            {formatPaiseCompact(featured.priceInPaise)}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <ButtonLink to="/gifting" size="lg">
              See gift boxes
            </ButtonLink>
            <Link
              to="/contact"
              className="text-sm underline underline-offset-4 transition-colors hover:text-cashew-deep"
            >
              Corporate gifting enquiries
            </Link>
          </div>
        </div>
      </Container>
    </Section>
  );
}
