import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { ProductCard } from '@/components/product/ProductCard';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Container, Section } from '@/components/ui/Section';
import { VegMark } from '@/components/ui/VegMark';
import { business, commerce } from '@/data/business';
import { getProduct, products } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { discountPercent, formatPaiseCompact } from '@/lib/money';
import { NotFoundPage } from './NotFoundPage';

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? getProduct(slug) : undefined;
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Reset the stepper when navigating between products.
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setQuantity(1);
  }

  if (!product) return <NotFoundPage />;

  const discount = discountPercent(product.priceInPaise, product.mrpInPaise);
  const others = products.filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <>
      <Section className="pt-8 pb-16 sm:pt-12">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
            <Link to="/shop" className="transition-colors hover:text-cashew-deep">
              Shop
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span aria-current="page">{product.name}</span>
          </nav>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* self-start so the tinted panel hugs the image instead of
                stretching to the taller details column beside it. */}
            <div
              className="self-start overflow-hidden rounded-card"
              style={{ backgroundColor: `var(${product.accentVar})` }}
            >
              <img
                src={product.image}
                alt={`Nuto ${product.name} — ${product.tagline} cashews in a ${product.weightGrams}g jar`}
                className="w-full object-cover"
                width={720}
                height={1080}
                fetchPriority="high"
              />
            </div>

            <div className="lg:py-4">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-4xl font-semibold sm:text-5xl">
                  {product.name}
                </h1>
                <VegMark className="size-5" />
              </div>
              <p className="mt-2 text-lg text-ink-soft">{product.tagline}</p>

              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl font-semibold tabular-nums">
                  {formatPaiseCompact(product.priceInPaise)}
                </span>
                {product.mrpInPaise && (
                  <span className="text-ink-muted line-through tabular-nums">
                    {formatPaiseCompact(product.mrpInPaise)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="rounded-full bg-cashew-pale px-2.5 py-1 text-xs font-semibold text-cashew-deep">
                    Save {discount}%
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                Net weight {product.weightGrams}g &middot; inclusive of all taxes
              </p>

              <p className="mt-6 text-ink-soft">{product.description}</p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {product.tastingNotes.map((note) => (
                  <li
                    key={note}
                    className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft"
                  >
                    {note}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <QuantityStepper
                  quantity={quantity}
                  onChange={setQuantity}
                  itemLabel={product.name}
                />
                <Button
                  size="lg"
                  onClick={() => addItem(product.slug, quantity)}
                  disabled={!product.inStock}
                  className="flex-1 sm:flex-none"
                >
                  {product.inStock ? 'Add to cart' : 'Sold out'}
                </Button>
              </div>
              <p className="mt-3 text-xs text-ink-muted">
                Free shipping over{' '}
                {formatPaiseCompact(commerce.freeShippingThresholdInPaise)} &middot; Cash on
                Delivery available
              </p>

              <dl className="mt-10 divide-y divide-line border-t border-line text-sm">
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-ink-muted">Ingredients</dt>
                  <dd>{product.ingredients.join(', ')}</dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-ink-muted">Net weight</dt>
                  <dd>{product.weightGrams}g</dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-ink-muted">Storage</dt>
                  <dd>
                    Keep the jar sealed in a cool, dry place away from direct sunlight. Best
                    within 30 days of opening.
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-ink-muted">Allergens</dt>
                  <dd>
                    Contains tree nuts (cashew)
                    {product.ingredients.some((item) => /milk|chocolate/i.test(item)) &&
                      ' and milk'}
                    . Packed in a facility that handles tree nuts.
                  </dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-ink-muted">FSSAI</dt>
                  <dd>Licence No. {business.fssaiLicence}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="border-t border-line bg-sand">
        <Container>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Try these next
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:gap-x-8 lg:grid-cols-3">
            {others.map((item) => (
              <li key={item.slug}>
                <ProductCard product={item} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
