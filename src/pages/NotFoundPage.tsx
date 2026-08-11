import { ButtonLink } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Section';

export function NotFoundPage() {
  return (
    <Section className="pt-16 sm:pt-24">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="font-display text-6xl font-semibold text-cashew">404</p>
          <h1 className="mt-4 text-3xl font-semibold">We could not find that page</h1>
          <p className="mt-3 text-ink-soft">
            It may have moved, or the link may be wrong. The cashews are all still here.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink to="/shop" size="lg">
              Shop the range
            </ButtonLink>
            <ButtonLink to="/" variant="secondary" size="lg">
              Go home
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
