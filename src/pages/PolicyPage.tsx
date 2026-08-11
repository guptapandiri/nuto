import { Link, useParams } from 'react-router';
import { Container, Section } from '@/components/ui/Section';
import { getPolicy, policies } from '@/data/policies';
import { NotFoundPage } from './NotFoundPage';

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function PolicyPage() {
  const { slug } = useParams<{ slug: string }>();
  const policy = slug ? getPolicy(slug) : undefined;

  if (!policy) return <NotFoundPage />;

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <nav aria-label="Policies" className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="text-xs font-semibold tracking-[0.18em] text-ink-muted uppercase">
              Policies
            </h2>
            <ul className="mt-4 space-y-2.5">
              {policies.map((item) => (
                <li key={item.slug}>
                  <Link
                    to={`/policies/${item.slug}`}
                    aria-current={item.slug === policy.slug ? 'page' : undefined}
                    className={
                      item.slug === policy.slug
                        ? 'text-sm font-medium text-cashew-deep'
                        : 'text-sm text-ink-soft transition-colors hover:text-cashew-deep'
                    }
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <article className="max-w-2xl">
            <h1 className="text-3xl font-semibold sm:text-4xl">{policy.title}</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Last updated {dateFormatter.format(new Date(policy.updated))}
            </p>

            {policy.sections.map((section) => (
              <section key={section.heading} className="mt-9">
                <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </Container>
    </Section>
  );
}
