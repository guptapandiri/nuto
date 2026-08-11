import { ButtonLink } from '@/components/ui/Button';
import { Container, Section, SectionHeading } from '@/components/ui/Section';
import { business } from '@/data/business';

export function StoryPage() {
  return (
    <>
      <Section className="pt-12 pb-0 sm:pt-16">
        <Container>
          <header className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-cashew-deep uppercase">
              Our story
            </p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">
              It started with a bad jar of cashews.
            </h1>
          </header>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div className="overflow-hidden rounded-card">
              <img
                src="/combos/seven-pack-lineup.png"
                alt="The Nuto range lined up with their spice blends"
                className="w-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="space-y-5 text-ink-soft">
              <p>
                Every celebration in this country involves a bowl of cashews somewhere. And
                almost every one of those bowls is a disappointment — broken pieces, stale
                oil, a dusting of masala doing the work the nut should have done.
              </p>
              <p>
                We thought the problem was the nut. It turned out to be everything after
                it: how it is graded, how it is roasted, how long it sits in a warehouse
                before it reaches you.
              </p>
              <p>
                So {business.name} starts at the grade. Whole W240, the large unbroken
                cashew, because you cannot hide behind seasoning when people can see the
                nut through the window. Then dry-roasted in small batches in{' '}
                {business.city}, seasoned with things we would use in our own kitchen, and
                sealed the same day.
              </p>
              <p>
                Six flavours, because that is how many we could make properly. When we work
                out a seventh worth your money, we will add it.
              </p>
              <p className="font-display text-xl text-ink italic">
                Flavor in every fold.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line bg-sand">
        <Container>
          <SectionHeading
            title="Start with the one everyone agrees on"
            description="Original — whole cashews, Himalayan pink salt, nothing else."
            align="center"
          />
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink to="/product/original" size="lg">
              Try Original
            </ButtonLink>
            <ButtonLink to="/shop" variant="secondary" size="lg">
              See all six
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
