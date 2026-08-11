import { Link } from 'react-router';
import { ButtonLink } from '@/components/ui/Button';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { VegMark } from '@/components/ui/VegMark';
import { whatsappLink } from '@/data/business';
import { giftBoxes } from '@/data/giftBoxes';
import { getProduct } from '@/data/products';
import { discountPercent, formatPaiseCompact } from '@/lib/money';

export function GiftingPage() {
  return (
    <>
      <Section className="pt-12 pb-0 sm:pt-16">
        <Container>
          <header className="max-w-2xl">
            <h1 className="text-4xl font-semibold sm:text-5xl">Gifting</h1>
            <p className="mt-4 text-lg text-ink-soft">
              Festival hampers, wedding returns and the corporate order that has to go out
              by Friday. Boxed, sealed, and good enough that nobody re-gifts it.
            </p>
          </header>
        </Container>
      </Section>

      <Section>
        <Container>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {giftBoxes.map((box) => {
              const discount = discountPercent(box.priceInPaise, box.mrpInPaise);
              return (
                <li key={box.slug} className="flex flex-col">
                  <div className="overflow-hidden rounded-card bg-sand">
                    <img
                      src={box.image}
                      alt={`The ${box.name} gift box`}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  <h2 className="mt-5 flex items-center gap-2 font-display text-xl font-semibold">
                    {box.name}
                    <VegMark />
                  </h2>
                  <p className="mt-2 flex-1 text-sm text-ink-soft">{box.description}</p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {box.contents.map((slug) => {
                      const product = getProduct(slug);
                      if (!product) return null;
                      return (
                        <li key={slug}>
                          <Link
                            to={`/product/${slug}`}
                            className="inline-block rounded-full px-2.5 py-1 text-[11px] font-medium text-white transition-opacity hover:opacity-80"
                            style={{ backgroundColor: `var(${product.accentVar})` }}
                          >
                            {product.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-lg font-semibold tabular-nums">
                      {formatPaiseCompact(box.priceInPaise)}
                    </span>
                    {box.mrpInPaise && (
                      <span className="text-sm text-ink-muted line-through tabular-nums">
                        {formatPaiseCompact(box.mrpInPaise)}
                      </span>
                    )}
                    {discount > 0 && (
                      <span className="text-xs font-semibold text-cashew-deep">
                        Save {discount}%
                      </span>
                    )}
                  </div>

                  <a
                    href={whatsappLink(
                      `Hi Nuto, I'd like to order the ${box.name} gift box.`,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full rounded-full border border-ink/20 py-2.5 text-center text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-shell"
                  >
                    Enquire on WhatsApp
                  </a>
                </li>
              );
            })}
          </ul>

          {/* Boxes are enquiry-only for now: box SKUs, stock and packaging costs are not set. */}
          <p className="mt-8 text-sm text-ink-muted">
            Gift boxes are made to order, so they are handled over WhatsApp rather than
            through the cart.
          </p>
        </Container>
      </Section>

      <Section className="border-t border-line bg-sand">
        <Container>
          <SectionHeading
            eyebrow="Corporate gifting"
            title="Ordering for a whole office?"
            description="We take bulk orders with custom boxes, printed cards and your logo on the sleeve. Tell us your headcount and the date you need them by."
            align="center"
          />
          <div className="mt-8 flex justify-center">
            <ButtonLink to="/contact" size="lg">
              Talk to us
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
