import { useLocation } from 'react-router';
import { ButtonLink } from '@/components/ui/Button';
import { Container, Section } from '@/components/ui/Section';
import { business, whatsappLink } from '@/data/business';
import { formatPaiseCompact } from '@/lib/money';
import type { PlacedOrder } from '@/types';

export function OrderConfirmedPage() {
  const location = useLocation();
  const order = location.state as PlacedOrder | null;

  // Reached directly (refresh, bookmark, back button) — there is no order to show.
  if (!order?.reference) {
    return (
      <Section className="pt-12 sm:pt-16">
        <Container>
          <div className="mx-auto max-w-lg rounded-card border border-line px-6 py-16 text-center">
            <h1 className="font-display text-2xl font-semibold">No order to show</h1>
            <p className="mt-3 text-ink-soft">
              Order details are only shown once, right after checkout. If you have just
              placed an order, check your email for the confirmation.
            </p>
            <ButtonLink to="/shop" size="lg" className="mt-6">
              Back to the shop
            </ButtonLink>
          </div>
        </Container>
      </Section>
    );
  }

  const { address, totals, lines, paymentMethod, reference } = order;

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-card border border-line bg-sand p-8 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10">
              <svg viewBox="0 0 24 24" className="size-6 text-success" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </span>
            <h1 className="mt-5 font-display text-3xl font-semibold">Order placed</h1>
            <p className="mt-2 text-ink-soft">
              Thank you, {address.fullName.split(' ')[0]}. We have sent a confirmation to{' '}
              {address.email}.
            </p>
            <p className="mt-6 text-sm text-ink-muted">Order reference</p>
            <p className="font-display text-2xl font-semibold tracking-wide">{reference}</p>
          </div>

          <div className="mt-8 rounded-card border border-line p-6">
            <h2 className="font-display text-lg font-semibold">What you ordered</h2>
            <ul className="mt-4 divide-y divide-line">
              {lines.map((line) => (
                <li key={line.slug} className="flex items-center gap-4 py-3">
                  <img
                    src={line.image}
                    alt=""
                    className="size-14 shrink-0 rounded-lg object-cover"
                  />
                  <span className="flex-1 text-sm">
                    {line.name}
                    <span className="text-ink-muted"> &times;{line.quantity}</span>
                  </span>
                  <span className="text-sm tabular-nums">
                    {formatPaiseCompact(line.lineTotalInPaise)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
              {totals.discountInPaise > 0 && (
                <div className="flex justify-between text-success">
                  <dt>Coupon discount</dt>
                  <dd className="tabular-nums">−{formatPaiseCompact(totals.discountInPaise)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-ink-soft">Shipping</dt>
                <dd className="tabular-nums">
                  {totals.shippingInPaise === 0
                    ? 'Free'
                    : formatPaiseCompact(totals.shippingInPaise)}
                </dd>
              </div>
              {totals.codFeeInPaise > 0 && (
                <div className="flex justify-between">
                  <dt className="text-ink-soft">COD handling fee</dt>
                  <dd className="tabular-nums">
                    {formatPaiseCompact(totals.codFeeInPaise)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
                <dt>{paymentMethod === 'cod' ? 'Pay on delivery' : 'Paid'}</dt>
                <dd className="tabular-nums">{formatPaiseCompact(totals.totalInPaise)}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="rounded-card border border-line p-6">
              <h2 className="font-display text-lg font-semibold">Delivering to</h2>
              <address className="mt-3 text-sm leading-relaxed text-ink-soft not-italic">
                {address.fullName}
                <br />
                {address.addressLine1}
                <br />
                {address.addressLine2}
                {address.landmark && (
                  <>
                    <br />
                    Near {address.landmark}
                  </>
                )}
                <br />
                {address.city} {address.pincode}
                <br />
                {address.state}
                <br />
                <span className="text-ink">+91 {address.mobile}</span>
              </address>
            </div>

            <div className="rounded-card border border-line p-6">
              <h2 className="font-display text-lg font-semibold">What happens next</h2>
              <ol className="mt-3 space-y-2 text-sm text-ink-soft">
                <li>We pack and seal your jars in {business.city}.</li>
                <li>You get a tracking link by email and SMS within 48 hours.</li>
                <li>Delivery usually takes 3–6 working days.</li>
              </ol>
              <a
                href={whatsappLink(`Hi Nuto, I have a question about order ${reference}.`)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm underline underline-offset-4 transition-colors hover:text-cashew-deep"
              >
                Message us on WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-10 text-center">
            <ButtonLink to="/shop" variant="secondary" size="lg">
              Continue shopping
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
