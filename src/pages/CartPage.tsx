import { CartLineItem } from '@/components/cart/CartLineItem';
import { ShippingProgress } from '@/components/cart/ShippingProgress';
import { ButtonLink } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Section';
import { useCart } from '@/hooks/useCart';
import { formatPaiseCompact } from '@/lib/money';
import { calculateTotals } from '@/lib/totals';

export function CartPage() {
  const { resolvedLines, setQuantity, removeItem, subtotalInPaise } = useCart();
  const totals = calculateTotals(resolvedLines);

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <h1 className="text-4xl font-semibold sm:text-5xl">Your cart</h1>

        {resolvedLines.length === 0 ? (
          <div className="mt-10 rounded-card border border-line px-6 py-16 text-center">
            <p className="text-ink-soft">There is nothing in your cart yet.</p>
            <ButtonLink to="/shop" size="lg" className="mt-6">
              Shop the range
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16">
            <ul className="divide-y divide-line border-y border-line">
              {resolvedLines.map((line) => (
                <CartLineItem
                  key={line.slug}
                  line={line}
                  onQuantityChange={(quantity) => setQuantity(line.slug, quantity)}
                  onRemove={() => removeItem(line.slug)}
                />
              ))}
            </ul>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-card border border-line p-6">
                <h2 className="font-display text-lg font-semibold">Order summary</h2>

                <div className="mt-5">
                  <ShippingProgress subtotalInPaise={subtotalInPaise} />
                </div>

                <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd className="tabular-nums">
                      {formatPaiseCompact(totals.subtotalInPaise)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Shipping</dt>
                    <dd className="tabular-nums">
                      {totals.shippingInPaise === 0
                        ? 'Free'
                        : formatPaiseCompact(totals.shippingInPaise)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">
                      {formatPaiseCompact(totals.totalInPaise)}
                    </dd>
                  </div>
                </dl>

                <ButtonLink to="/checkout" size="lg" className="mt-6 w-full">
                  Checkout
                </ButtonLink>
                <p className="mt-3 text-center text-xs text-ink-muted">
                  A Cash on Delivery fee applies if you choose COD at checkout.
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </Section>
  );
}
