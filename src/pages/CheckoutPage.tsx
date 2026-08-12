import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Container, Section } from '@/components/ui/Section';
import { commerce } from '@/data/business';
import { indianStates } from '@/data/indianStates';
import { useCart } from '@/hooks/useCart';
import { useAccount } from '@/hooks/useAccount';
import { cn } from '@/lib/cn';
import { resolveCoupon } from '@/lib/coupon';
import { formatPaiseCompact } from '@/lib/money';
import { OrderError, submitOrder } from '@/lib/payment';
import { calculateTotals } from '@/lib/totals';
import { hasErrors, normaliseMobile, validateAddress, type FieldErrors } from '@/lib/validation';
import type { PaymentMethod, ShippingAddress } from '@/types';

const emptyAddress: ShippingAddress = {
  fullName: '',
  mobile: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { resolvedLines, clearCart } = useCart();
  const { account } = useAccount();

  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('prepaid');
  const [errors, setErrors] = useState<FieldErrors<ShippingAddress>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) return;
    setAddress((current) => ({
      ...current,
      fullName: current.fullName || account.name,
      mobile: current.mobile || account.mobile,
      email: current.email || account.email,
    }));
  }, [account]);

  const totals = calculateTotals(resolvedLines, paymentMethod, couponCode);

  function update<K extends keyof ShippingAddress>(key: K, value: string) {
    setAddress((current) => ({ ...current, [key]: value }));
    // Clear a field's error as soon as the customer starts fixing it.
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    const validationErrors = validateAddress(address);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      // Move focus to the first invalid control so the error is not missed.
      const firstKey = Object.keys(validationErrors)[0];
      document.querySelector<HTMLElement>(`[data-field="${firstKey}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const normalised: ShippingAddress = {
        ...address,
        mobile: normaliseMobile(address.mobile),
      };
      const result = await submitOrder(resolvedLines, normalised, paymentMethod, couponCode);

      clearCart();
      navigate('/order-confirmed', {
        replace: true,
        state: {
          reference: result.reference,
          placedAt: result.placedAt,
          lines: resolvedLines,
          // Server totals, not the ones computed in the browser.
          totals: {
            subtotalInPaise: result.totals.subtotalPaise,
            discountInPaise: result.totals.discountPaise,
            shippingInPaise: result.totals.shippingPaise,
            codFeeInPaise: result.totals.codFeePaise,
            totalInPaise: result.totals.totalPaise,
            freeShippingShortfallInPaise: 0,
          },
          address: normalised,
          paymentMethod,
        },
      });
    } catch (error) {
      setSubmitError(
        error instanceof OrderError || error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function applyCoupon() {
    const coupon = resolveCoupon(couponInput, paymentMethod, totals.subtotalInPaise);
    if (coupon.error) {
      setCouponCode(undefined);
      setCouponError(coupon.error);
      return;
    }
    setCouponCode(coupon.code ?? undefined);
    setCouponError(null);
  }

  function changePaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    if (couponCode && method !== 'prepaid') {
      setCouponCode(undefined);
      setCouponError('PREPAID10 was removed because it applies to online payment only.');
    }
  }

  if (resolvedLines.length === 0) {
    return (
      <Section className="pt-12 sm:pt-16">
        <Container>
          <h1 className="text-4xl font-semibold sm:text-5xl">Checkout</h1>
          <div className="mt-10 rounded-card border border-line px-6 py-16 text-center">
            <p className="text-ink-soft">
              Your cart is empty, so there is nothing to check out.
            </p>
            <ButtonLink to="/shop" size="lg" className="mt-6">
              Shop the range
            </ButtonLink>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#1B7A4B] px-4 py-3 text-white sm:px-5">
          <p className="text-[13px] font-semibold">Pay online and save 10% with code PREPAID10.</p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide">PREPAID OFFER</span>
        </div>
        <h1 className="text-4xl font-semibold sm:text-5xl">Checkout</h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16"
        >
          <div>
            <h2 className="font-display text-xl font-semibold">Delivery address</h2>
            <p className="mt-1 text-sm text-ink-muted">
              We ship across India. All fields marked * are required.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full name" error={errors.fullName} required>
                  {(props) => (
                    <input
                      {...props}
                      data-field="fullName"
                      type="text"
                      autoComplete="name"
                      value={address.fullName}
                      onChange={(event) => update('fullName', event.target.value)}
                    />
                  )}
                </Field>
              </div>

              <Field
                label="Mobile number"
                error={errors.mobile}
                hint="10 digits — we send delivery updates here."
                required
              >
                {(props) => (
                  <input
                    {...props}
                    data-field="mobile"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={14}
                    placeholder="98765 43210"
                    value={address.mobile}
                    onChange={(event) => update('mobile', event.target.value)}
                  />
                )}
              </Field>

              <Field label="Email" error={errors.email} required>
                {(props) => (
                  <input
                    {...props}
                    data-field="email"
                    type="email"
                    autoComplete="email"
                    value={address.email}
                    onChange={(event) => update('email', event.target.value)}
                  />
                )}
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Flat, house no., building"
                  error={errors.addressLine1}
                  required
                >
                  {(props) => (
                    <input
                      {...props}
                      data-field="addressLine1"
                      type="text"
                      autoComplete="address-line1"
                      value={address.addressLine1}
                      onChange={(event) => update('addressLine1', event.target.value)}
                    />
                  )}
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Area, street, sector" error={errors.addressLine2} required>
                  {(props) => (
                    <input
                      {...props}
                      data-field="addressLine2"
                      type="text"
                      autoComplete="address-line2"
                      value={address.addressLine2}
                      onChange={(event) => update('addressLine2', event.target.value)}
                    />
                  )}
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Landmark" hint="Optional — helps the courier find you.">
                  {(props) => (
                    <input
                      {...props}
                      data-field="landmark"
                      type="text"
                      value={address.landmark}
                      onChange={(event) => update('landmark', event.target.value)}
                    />
                  )}
                </Field>
              </div>

              <Field label="Town / city" error={errors.city} required>
                {(props) => (
                  <input
                    {...props}
                    data-field="city"
                    type="text"
                    autoComplete="address-level2"
                    value={address.city}
                    onChange={(event) => update('city', event.target.value)}
                  />
                )}
              </Field>

              <Field label="PIN code" error={errors.pincode} required>
                {(props) => (
                  <input
                    {...props}
                    data-field="pincode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    placeholder="500001"
                    value={address.pincode}
                    onChange={(event) =>
                      update('pincode', event.target.value.replace(/\D/g, ''))
                    }
                  />
                )}
              </Field>

              <div className="sm:col-span-2">
                <Field label="State" error={errors.state} required>
                  {(props) => (
                    <select
                      {...props}
                      data-field="state"
                      autoComplete="address-level1"
                      value={address.state}
                      onChange={(event) => update('state', event.target.value)}
                    >
                      <option value="">Select a state or union territory</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
              </div>
            </div>

            <h2 className="mt-12 font-display text-xl font-semibold">Payment</h2>
            <fieldset className="mt-4">
              <legend className="sr-only">Choose a payment method</legend>
              <div className="grid gap-3">
                <PaymentOption
                  value="prepaid"
                  checked={paymentMethod === 'prepaid'}
                  onChange={changePaymentMethod}
                  title="Pay online"
                  description="UPI, cards, net banking and wallets. No extra fee."
                />
                <PaymentOption
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={changePaymentMethod}
                  title="Cash on Delivery"
                  description={`Pay the courier when your order arrives. ${formatPaiseCompact(
                    commerce.codFeeInPaise,
                  )} handling fee.`}
                />
              </div>
            </fieldset>

            <div className="mt-6 rounded-lg border border-line bg-sand p-4">
              <label htmlFor="coupon" className="block text-sm font-semibold">Coupon code</label>
              <p className="mt-1 text-xs text-ink-muted">Use PREPAID10 for 10% off online-payment orders.</p>
              <div className="mt-3 flex gap-2">
                <input
                  id="coupon"
                  type="text"
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="min-w-0 flex-1 rounded-lg border border-line bg-white px-3 py-2.5 text-sm uppercase focus:border-ink focus:outline-none"
                />
                <button type="button" onClick={applyCoupon} className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-shell hover:bg-ink/90">
                  Apply
                </button>
              </div>
              {couponCode && <p className="mt-2 text-xs font-medium text-success">{couponCode} applied — you save {formatPaiseCompact(totals.discountInPaise)}.</p>}
              {couponError && <p role="alert" className="mt-2 text-xs text-danger">{couponError}</p>}
            </div>

            {/* Orders are now really recorded; only the payment step is missing. */}
            <p className="mt-4 rounded-lg bg-cashew-pale px-4 py-3 text-xs text-cashew-deep">
              <strong className="font-semibold">No online payment yet.</strong> Your order is
              recorded and we will contact you to arrange payment. Choose Cash on Delivery
              to pay the courier instead.
            </p>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-card border border-line p-6">
              <h2 className="font-display text-lg font-semibold">Your order</h2>

              <ul className="mt-5 space-y-3 border-b border-line pb-5">
                {resolvedLines.map((line) => (
                  <li key={line.slug} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0">
                      {line.name}
                      <span className="text-ink-muted"> &times;{line.quantity}</span>
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatPaiseCompact(line.lineTotalInPaise)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="tabular-nums">
                    {formatPaiseCompact(totals.subtotalInPaise)}
                  </dd>
                </div>
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
                <div className="flex justify-between border-t border-line pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPaiseCompact(totals.totalInPaise)}</dd>
                </div>
              </dl>

              {submitError && (
                <p role="alert" className="mt-4 text-sm text-danger">
                  {submitError}
                </p>
              )}

              <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Placing order…'
                  : paymentMethod === 'cod'
                    ? 'Place COD order'
                    : `Pay ${formatPaiseCompact(totals.totalInPaise)}`}
              </Button>
              <p className="mt-3 text-center text-xs text-ink-muted">
                Inclusive of all taxes.
              </p>
            </div>
          </aside>
        </form>
      </Container>
    </Section>
  );
}

interface PaymentOptionProps {
  value: PaymentMethod;
  checked: boolean;
  onChange: (value: PaymentMethod) => void;
  title: string;
  description: string;
}

function PaymentOption({
  value,
  checked,
  onChange,
  title,
  description,
}: PaymentOptionProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border p-4 transition-colors',
        checked ? 'border-ink bg-sand' : 'border-line hover:border-ink/30',
      )}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 size-4 shrink-0 accent-ink"
      />
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-soft">{description}</span>
      </span>
    </label>
  );
}
