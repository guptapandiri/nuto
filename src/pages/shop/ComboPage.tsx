import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Carousel } from '@/components/ui/Carousel';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { comboSlug } from '@/data/catalogue';
import {
  combos,
  getCombo,
  partsTotalInPaise,
  savingsInPaise,
  savingsPercent,
  totalGrams,
} from '@/data/combos';
import { flavours, packSizes, rupees } from '@/data/range';
import { useCart } from '@/hooks/useCart';
import { ComboCard } from './ComboCard';
import { ShopLayout, TrustStrip } from './ShopLayout';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';

export function ComboPage() {
  const { slug } = useParams<{ slug: string }>();
  const combo = slug ? getCombo(slug) : undefined;
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setQuantity(1);
  }

  if (!combo) {
    return (
      <ShopLayout>
        <div className="mx-auto max-w-7xl px-4 py-24 text-center">
          <h1 className="text-2xl font-extrabold">Combo not found</h1>
          <Link to="/" className="mt-4 inline-block text-[#1B7A4B] underline">
            Back to the shop
          </Link>
        </div>
      </ShopLayout>
    );
  }

  const parts = partsTotalInPaise(combo);
  const saved = savingsInPaise(combo);
  const percent = savingsPercent(combo);
  const grams = totalGrams(combo);
  const others = combos.filter((item) => item.slug !== combo.slug);

  return (
    <ShopLayout>
      <div className="mx-auto max-w-7xl px-4 py-5">
        <nav aria-label="Breadcrumb" className="text-[12px] text-neutral-500">
          <Link to="/" className="hover:text-neutral-900">
            Shop
          </Link>
          <span className="mx-1.5">/</span>
          <Link to="/#combos" className="hover:text-neutral-900">
            Combos
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-neutral-900">{combo.name}</span>
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <img
                src={combo.image}
                alt={`Nuto ${combo.name}`}
                className="aspect-[4/3] w-full object-cover"
                fetchPriority="high"
              />
            </div>
          </div>

          <div>
            {combo.badge && (
              <span className="inline-block rounded bg-neutral-900 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                {combo.badge}
              </span>
            )}
            <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{combo.name}</h1>
            <p className="mt-1 text-[14px] text-neutral-500">{combo.tagline}</p>

            <p className="mt-4 text-[14px] leading-relaxed text-neutral-700">
              {combo.description}
            </p>

            {/* Price, against what the parts would cost */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-extrabold tabular-nums">
                  ₹{rupees(combo.priceInPaise)}
                </span>
                <span className="text-[15px] text-neutral-400 line-through tabular-nums">
                  ₹{rupees(parts)}
                </span>
                {percent > 0 && (
                  <span className="rounded bg-[#E23744] px-1.5 py-0.5 text-[12px] font-bold text-white">
                    {percent}% OFF
                  </span>
                )}
              </div>
              {saved > 0 && (
                <p className="mt-1 text-[13px] font-semibold text-[#1B7A4B]">
                  You save ₹{rupees(saved)} versus buying these packs separately.
                </p>
              )}
              <p className="mt-1 text-[12px] text-neutral-500">
                {grams}g total · ₹{(combo.priceInPaise / 100 / grams).toFixed(2)} per gram ·
                inclusive of all taxes
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <QuantityStepper
                  quantity={quantity}
                  onChange={setQuantity}
                  itemLabel={combo.name}
                />
                <button
                  type="button"
                  onClick={() => addItem(comboSlug(combo.slug), quantity)}
                  className="flex-1 rounded-lg bg-[#1B7A4B] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#12351F] sm:flex-none"
                >
                  ADD TO CART
                </button>
                <FavoriteButton slug={comboSlug(combo.slug)} itemLabel={combo.name} />
              </div>
            </div>

            {/* Contents */}
            <h2 className="mt-8 text-[15px] font-bold">What&apos;s inside</h2>
            <ul className="mt-3 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white">
              {combo.items.map((item) => {
                const flavour = flavours.find((f) => f.slug === item.flavourSlug);
                const size = packSizes.find((option) => option.grams === item.grams);
                if (!flavour || !size) return null;
                return (
                  <li key={`${item.flavourSlug}-${item.grams}`} className="flex items-center gap-3 p-3">
                    <Link to={`/p/${flavour.slug}`} className="shrink-0">
                      <img
                        src={flavour.image}
                        alt=""
                        className="size-12 rounded-lg object-cover"
                        loading="lazy"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/p/${flavour.slug}`}
                        className="text-[14px] font-semibold hover:text-[#1B7A4B]"
                      >
                        {flavour.name}
                      </Link>
                      <p className="text-[12px] text-neutral-500">
                        {item.grams}g
                        {item.quantity > 1 && ` × ${item.quantity}`} · {flavour.note}
                      </p>
                    </div>
                    <span className="shrink-0 text-[13px] text-neutral-400 tabular-nums">
                      ₹{rupees(size.priceInPaise * item.quantity)}
                    </span>
                  </li>
                );
              })}
              <li className="flex items-center justify-between p-3 text-[13px] font-semibold">
                <span>Bought separately</span>
                <span className="tabular-nums">₹{rupees(parts)}</span>
              </li>
              <li className="flex items-center justify-between bg-[#1B7A4B]/6 p-3 text-[14px] font-bold text-[#1B7A4B]">
                <span>In this combo</span>
                <span className="tabular-nums">₹{rupees(combo.priceInPaise)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <TrustStrip />

      <Carousel
        title="Other combos"
        subtitle="More ways to buy a few at once"
        className="py-8"
        itemClassName="w-[15rem] sm:w-[17rem]"
      >
        {others.map((item) => (
          <ComboCard key={item.slug} combo={item} />
        ))}
      </Carousel>
    </ShopLayout>
  );
}
