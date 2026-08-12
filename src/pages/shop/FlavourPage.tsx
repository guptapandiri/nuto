import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { variantSlug } from '@/data/catalogue';
import { flavours, packSizes, rupees } from '@/data/range';
import { useCart } from '@/hooks/useCart';
import { isValidPincode } from '@/lib/validation';
import { Carousel } from '@/components/ui/Carousel';
import { combos } from '@/data/combos';
import { ComboCard } from './ComboCard';
import { FlavourCard } from './FlavourCard';
import { ShopLayout, TrustStrip } from './ShopLayout';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

const MRP_MULTIPLIER = 1.25;

export function FlavourPage() {
  const { slug } = useParams<{ slug: string }>();
  const flavour = flavours.find((item) => item.slug === slug);

  const [sizeIndex, setSizeIndex] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Reset selections when navigating between flavours.
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setSizeIndex(1);
    setQuantity(1);
  }

  if (!flavour) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold">Flavour not found</h1>
          <Link to="/" className="mt-4 inline-block text-[#1B7A4B] underline">
            Back to the shop
          </Link>
        </div>
      </ShopLayout>
    );
  }

  const size = packSizes[sizeIndex] ?? packSizes[0]!;
  const mrp = Math.round((size.priceInPaise * MRP_MULTIPLIER) / 100) * 100;
  const discount = Math.round(((mrp - size.priceInPaise) / mrp) * 100);
  const others = flavours.filter((item) => item.slug !== flavour.slug);
  // Combos containing this flavour — a natural upsell from a single pack.
  const relatedCombos = combos.filter((combo) =>
    combo.items.some((item) => item.flavourSlug === flavour.slug),
  );

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-5">
        <nav aria-label="Breadcrumb" className="text-[12px] text-neutral-500">
          <Link to="/" className="hover:text-neutral-900">
            Shop
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-900">{flavour.name}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
          {/* Gallery */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <img
                src={flavour.image}
                alt={`Nuto ${flavour.name} cashews`}
                className="aspect-square w-full object-cover"
                width={640}
                height={640}
                fetchPriority="high"
              />
            </div>
          </div>

          {/* Buy box */}
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">{flavour.name} Cashews</h1>
            <p className="mt-1 text-[14px] text-neutral-500">{flavour.note}</p>

            <div className="mt-3 flex items-center gap-2 text-[12px]">
              <span className="flex items-center gap-0.5 rounded bg-[#1B7A4B] px-1.5 py-0.5 font-bold text-white">
                {flavour.rating.toFixed(1)}
                <svg viewBox="0 0 24 24" className="size-3" fill="currentColor" aria-hidden="true">
                  <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.8 21l1.4-6.9L2 9.3l7-.8L12 2Z" />
                </svg>
              </span>
              <span className="text-neutral-500">{flavour.reviewCount} ratings</span>
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase"
                style={{ backgroundColor: flavour.accent }}
              >
                {flavour.heat === 0
                  ? 'Mild'
                  : flavour.heat === 1
                    ? 'Medium'
                    : flavour.heat === 2
                      ? 'Hot'
                      : 'Extra hot'}
              </span>
            </div>

            <p className="mt-4 text-[14px] leading-relaxed text-neutral-700">{flavour.blurb}</p>

            {/* Size */}
            <fieldset className="mt-6">
              <legend className="text-[13px] font-semibold">Pack size</legend>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {packSizes.map((option, index) => {
                  const active = index === sizeIndex;
                  const optionMrp = Math.round((option.priceInPaise * MRP_MULTIPLIER) / 100) * 100;
                  return (
                    <button
                      key={option.grams}
                      type="button"
                      onClick={() => setSizeIndex(index)}
                      aria-pressed={active}
                      className={`rounded-lg border-2 p-2.5 text-left transition-colors ${
                        active
                          ? 'border-[#1B7A4B] bg-[#1B7A4B]/6'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      <span className="block text-[13px] font-bold">{option.grams}g</span>
                      <span className="block text-[13px] tabular-nums">
                        ₹{rupees(option.priceInPaise)}
                      </span>
                      <span className="block text-[11px] text-neutral-400 line-through tabular-nums">
                        ₹{rupees(optionMrp)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Price */}
            <div className="mt-5 flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-extrabold tabular-nums">
                ₹{rupees(size.priceInPaise)}
              </span>
              <span className="text-[15px] text-neutral-400 line-through tabular-nums">
                ₹{rupees(mrp)}
              </span>
              <span className="rounded bg-[#E23744] px-1.5 py-0.5 text-[12px] font-bold text-white">
                {discount}% OFF
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-neutral-500">
              Inclusive of all taxes · ₹{(size.priceInPaise / 100 / size.grams).toFixed(2)} per gram
            </p>

            {/* Add */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QuantityStepper
                quantity={quantity}
                onChange={setQuantity}
                itemLabel={`${flavour.name} ${size.grams}g`}
              />
              <button
                type="button"
                onClick={() => addItem(variantSlug(flavour.slug, size.grams), quantity)}
                className="flex-1 rounded-lg bg-[#1B7A4B] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#12351F] sm:flex-none"
              >
                ADD TO CART
              </button>
              <FavoriteButton
                slug={variantSlug(flavour.slug, size.grams)}
                itemLabel={`${flavour.name} ${size.grams}g`}
              />
            </div>

            <PincodeCheck />
            <Offers />

            <div className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
              <Accordion title="Description" defaultOpen>
                <p>{flavour.blurb}</p>
                <p className="mt-2">
                  Whole cashews, roasted and seasoned in Hyderabad, sealed the same day.
                </p>
              </Accordion>
              <Accordion title="Ingredients &amp; allergens">
                <p>
                  Contains tree nuts (cashew). Packed in a facility that handles tree nuts.
                </p>
              </Accordion>
              <Accordion title="Storage &amp; shelf life">
                <p>
                  Keep the pack sealed in a cool, dry place away from direct sunlight. Best
                  consumed within 30 days of opening.
                </p>
              </Accordion>
              <Accordion title="Shipping &amp; returns">
                <p>
                  Dispatched within 2 working days. Delivery usually takes 3–6 working days.
                  Damaged or incorrect orders are replaced in full — tell us within 48 hours.
                </p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      <TrustStrip />

      {relatedCombos.length > 0 && (
        <div className="border-b border-neutral-200 bg-white py-8">
          <Carousel
            title={`Combos with ${flavour.name}`}
            subtitle="Cheaper than buying the packs one at a time."
            itemClassName="w-[15rem] sm:w-[17rem]"
          >
            {relatedCombos.map((combo) => (
              <ComboCard key={combo.slug} combo={combo} />
            ))}
          </Carousel>
        </div>
      )}

      <Carousel
        title="You may also like"
        className="py-8"
        itemClassName="w-[10.5rem] sm:w-[13rem]"
      >
        {others.map((item) => (
          <FlavourCard key={item.slug} flavour={item} />
        ))}
      </Carousel>
    </ShopLayout>
  );
}

/** Delivery estimate by PIN code — a fixture of Indian D2C product pages. */
function PincodeCheck() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<string | null>(null);

  function check() {
    if (!isValidPincode(pincode)) {
      setResult('Enter a valid 6-digit PIN code.');
      return;
    }
    // No courier serviceability API wired up; this is an illustrative estimate.
    setResult(`Delivers to ${pincode} in 3–6 working days. Cash on Delivery available.`);
  }

  const invalid = result?.startsWith('Enter');

  return (
    <div className="mt-5 rounded-lg border border-neutral-200 bg-white p-3">
      <label htmlFor="pincode-check" className="text-[13px] font-semibold">
        Check delivery
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="pincode-check"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(event) => {
            setPincode(event.target.value.replace(/\D/g, ''));
            setResult(null);
          }}
          placeholder="500001"
          className="w-32 rounded-lg border border-neutral-300 px-3 py-2 text-[16px] focus:border-[#1B7A4B] focus:outline-none sm:text-[14px]"
        />
        <button
          type="button"
          onClick={check}
          className="rounded-lg border-2 border-[#1B7A4B] px-4 text-[13px] font-bold text-[#1B7A4B] hover:bg-[#1B7A4B] hover:text-white"
        >
          Check
        </button>
      </div>
      {result && (
        <p
          className={`mt-2 text-[12px] ${invalid ? 'text-[#E23744]' : 'text-[#1B7A4B]'}`}
          role="status"
        >
          {result}
        </p>
      )}
    </div>
  );
}

function Offers() {
  return (
    <ul className="mt-4 space-y-1.5">
      {[
        'Extra 10% off on prepaid orders — code PREPAID10',
        'Buy any 3 packs, get 1 free',
        'Free shipping on orders above ₹499',
      ].map((offer) => (
        <li key={offer} className="flex items-start gap-2 text-[12px] text-neutral-700">
          <span className="mt-0.5 text-[#1B7A4B]" aria-hidden="true">
            %
          </span>
          {offer}
        </li>
      ))}
    </ul>
  );
}

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-semibold">
        {title}
        <span className="text-neutral-400 transition-transform group-open:rotate-45" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="mt-2 text-[13px] leading-relaxed text-neutral-600">{children}</div>
    </details>
  );
}
