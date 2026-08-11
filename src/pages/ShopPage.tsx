import { useState } from 'react';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Container, Section } from '@/components/ui/Section';
import { flavourFilters, products, type FlavourFilter } from '@/data/products';
import { cn } from '@/lib/cn';

export function ShopPage() {
  const [filter, setFilter] = useState<FlavourFilter>('all');

  const visible =
    filter === 'all' ? products : products.filter((product) => product.flavour === filter);

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <header className="max-w-2xl">
          <h1 className="text-4xl font-semibold sm:text-5xl">Shop</h1>
          <p className="mt-4 text-lg text-ink-soft">
            Every flavour we make. All jars are sealed, vegetarian, and shipped across
            India.
          </p>
        </header>

        <div
          className="mt-10 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter by flavour"
        >
          {flavourFilters.map((option) => {
            const isActive = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={isActive}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm transition-colors',
                  isActive
                    ? 'border-ink bg-ink text-shell'
                    : 'border-line text-ink hover:border-ink/40',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'flavour' : 'flavours'}
        </p>

        <div className="mt-6">
          <ProductGrid products={visible} />
        </div>
      </Container>
    </Section>
  );
}
