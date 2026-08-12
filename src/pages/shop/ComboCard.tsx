import { Link } from 'react-router';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { FavoriteButton } from '@/components/favorites/FavoriteButton';
import { comboSlug } from '@/data/catalogue';
import {
  partsTotalInPaise,
  savingsInPaise,
  savingsPercent,
  totalGrams,
  type Combo,
} from '@/data/combos';
import { rupees } from '@/data/range';
import { useCart } from '@/hooks/useCart';

export function ComboCard({ combo }: { combo: Combo }) {
  const { addItem, setQuantity, lines } = useCart();
  const slug = comboSlug(combo.slug);
  const inCart = lines.find((line) => line.slug === slug)?.quantity ?? 0;

  const parts = partsTotalInPaise(combo);
  const saved = savingsInPaise(combo);
  const percent = savingsPercent(combo);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg">
      <div className="relative bg-neutral-50">
        <Link to={`/c/${combo.slug}`} aria-label={combo.name}>
          <img
            src={combo.image}
            alt={`Nuto ${combo.name}`}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
          />
        </Link>
        {saved > 0 && (
          <span className="absolute top-2 left-2 rounded bg-[#E23744] px-1.5 py-0.5 text-[11px] font-bold text-white">
            SAVE ₹{rupees(saved)}
          </span>
        )}
        <FavoriteButton
          slug={slug}
          itemLabel={combo.name}
          className="absolute top-2 right-2 shadow-sm"
        />
        {combo.badge && (
          <span className="absolute top-14 right-2 rounded bg-neutral-900/85 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
            {combo.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="text-[15px] leading-tight font-semibold">
          <Link to={`/c/${combo.slug}`} className="hover:text-[#1B7A4B]">
            {combo.name}
          </Link>
        </h3>
        <p className="mt-0.5 text-[12px] text-neutral-500">{combo.tagline}</p>

        <p className="mt-2 text-[11px] font-medium text-neutral-400">
          {totalGrams(combo)}g total · {combo.items.length} packs
        </p>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[17px] font-bold tabular-nums">
              ₹{rupees(combo.priceInPaise)}
            </span>
            <span className="text-[12px] text-neutral-400 line-through tabular-nums">
              ₹{rupees(parts)}
            </span>
            {percent > 0 && (
              <span className="text-[11px] font-bold text-[#1B7A4B]">{percent}% off</span>
            )}
          </div>

          <div className="mt-3">
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
                  itemLabel={combo.name}
                  allowRemove
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
