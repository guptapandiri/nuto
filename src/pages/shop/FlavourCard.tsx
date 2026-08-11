import { useState } from 'react';
import { Link } from 'react-router';
import { variantSlug } from '@/data/catalogue';
import { packSizes, rupees, type Flavour } from '@/data/range';
import { useCart } from '@/hooks/useCart';
import { QuantityStepper } from '@/components/ui/QuantityStepper';

/** Invented MRP so the strike-through and % off have something to sit against. */
const MRP_MULTIPLIER = 1.25;

/** Words rather than chilli emoji — emoji render inconsistently across devices. */
function heatLabel(heat: number): string {
  if (heat === 0) return 'Mild';
  if (heat === 1) return 'Medium';
  if (heat === 2) return 'Hot';
  return 'Extra hot';
}

export function FlavourCard({ flavour }: { flavour: Flavour }) {
  const [sizeIndex, setSizeIndex] = useState(1); // 100g default
  const { addItem, setQuantity, lines } = useCart();

  const size = packSizes[sizeIndex] ?? packSizes[0]!;
  const slug = variantSlug(flavour.slug, size.grams);
  const inCart = lines.find((line) => line.slug === slug)?.quantity ?? 0;

  const mrp = Math.round((size.priceInPaise * MRP_MULTIPLIER) / 100) * 100;
  const discount = Math.round(((mrp - size.priceInPaise) / mrp) * 100);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
      <div className="relative bg-neutral-50">
        <Link to={`/p/${flavour.slug}`} aria-label={`${flavour.name} cashews`}>
        <img
          src={flavour.image}
          alt={`Nuto ${flavour.name} cashews`}
          className="aspect-square w-full object-cover"
          loading="lazy"
        />
        </Link>
        <span className="absolute top-2 left-2 rounded bg-[#E23744] px-1.5 py-0.5 text-[11px] font-bold text-white">
          {discount}% OFF
        </span>
        <span
          className="absolute right-2 bottom-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase"
          style={{ backgroundColor: flavour.accent }}
        >
          {heatLabel(flavour.heat)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1 text-[11px]">
          <span className="flex items-center gap-0.5 rounded bg-[#1B7A4B] px-1.5 py-0.5 font-bold text-white">
            {flavour.rating.toFixed(1)}
            <svg viewBox="0 0 24 24" className="size-2.5" fill="currentColor" aria-hidden="true">
              <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.8 21l1.4-6.9L2 9.3l7-.8L12 2Z" />
            </svg>
          </span>
          <span className="text-neutral-500">({flavour.reviewCount})</span>
        </div>

        <h3 className="mt-2 text-[15px] leading-tight font-semibold">
          <Link to={`/p/${flavour.slug}`} className="hover:text-[#1B7A4B]">
            {flavour.name}
          </Link>
        </h3>
        <p className="mt-0.5 line-clamp-1 text-[12px] text-neutral-500">{flavour.note}</p>

        {/* Pack size selector — the primary variant control */}
        <div className="mt-3 flex gap-1.5" role="group" aria-label={`Pack size for ${flavour.name}`}>
          {packSizes.map((option, index) => (
            <button
              key={option.grams}
              type="button"
              onClick={() => setSizeIndex(index)}
              aria-pressed={index === sizeIndex}
              className={`flex-1 rounded border py-1 text-[11px] font-semibold transition-colors ${
                index === sizeIndex
                  ? 'border-[#1B7A4B] bg-[#1B7A4B]/8 text-[#1B7A4B]'
                  : 'border-neutral-300 text-neutral-600 hover:border-neutral-500'
              }`}
            >
              {option.grams}g
            </button>
          ))}
        </div>

        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[17px] font-bold tabular-nums">₹{rupees(size.priceInPaise)}</span>
          <span className="text-[12px] text-neutral-400 line-through tabular-nums">
            ₹{rupees(mrp)}
          </span>
        </div>

        <div className="mt-3 pt-0">
          {inCart === 0 ? (
            <button
              type="button"
              onClick={() => addItem(slug)}
              className="w-full rounded-lg border-2 border-[#1B7A4B] py-2 text-[13px] font-bold text-[#1B7A4B] transition-colors hover:bg-[#1B7A4B] hover:text-white"
            >
              ADD
            </button>
          ) : (
            <div className="flex justify-center">
              <QuantityStepper
                quantity={inCart}
                onChange={(quantity) => setQuantity(slug, quantity)}
                itemLabel={`${flavour.name} ${size.grams}g`}
                allowRemove
              />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
