import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Carousel } from '@/components/ui/Carousel';
import { combos } from '@/data/combos';
import { flavours, packSizes, rupees } from '@/data/range';
import { ComboCard } from './ComboCard';
import { FlavourCard } from './FlavourCard';
import { ShopLayout, TrustStrip } from './ShopLayout';

type SortKey = 'popular' | 'rating' | 'heat-low' | 'heat-high';

const filters = [
  { key: 'all', label: 'All flavours' },
  { key: 'mild', label: 'Mild' },
  { key: 'spicy', label: 'Spicy' },
  { key: 'bestsellers', label: 'Bestsellers' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

export function ShopV2Page({ searchOnly = false }: { searchOnly?: boolean }) {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('popular');

  // Sync searches submitted from product and combo pages into the live filter.
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    let list = flavours.filter((flavour) => {
      if (needle && !`${flavour.name} ${flavour.note}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (filter === 'mild') return flavour.heat <= 1;
      if (filter === 'spicy') return flavour.heat >= 2;
      if (filter === 'bestsellers') return flavour.reviewCount >= 250;
      return true;
    });

    list = [...list];
    if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    if (sort === 'heat-low') list.sort((a, b) => a.heat - b.heat);
    if (sort === 'heat-high') list.sort((a, b) => b.heat - a.heat);
    if (sort === 'popular') list.sort((a, b) => b.reviewCount - a.reviewCount);
    return list;
  }, [query, filter, sort]);

  return (
    <ShopLayout query={query} onQueryChange={setQuery}>

      {/* Promo banner */}
      {!searchOnly && <section className="bg-gradient-to-r from-[#12351F] to-[#1B7A4B]">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:grid-cols-[1.2fr_1fr] sm:py-12">
          <div className="text-white">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide uppercase">
              New launch
            </span>
            <h1 className="mt-3 text-2xl leading-tight font-extrabold sm:text-4xl">
              Seven flavours.
              <br />
              Starting at just ₹{rupees(packSizes[0]!.priceInPaise)}.
            </h1>
            <p className="mt-3 max-w-md text-[14px] text-white/80">
              Whole cashews, roasted and seasoned in Hyderabad. Try a 50g pack before you
              commit to a jar.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#range"
                className="rounded-lg bg-white px-5 py-2.5 text-[13px] font-bold text-[#12351F]"
              >
                Shop all flavours
              </a>
              <a
                href="#combos"
                className="rounded-lg border border-white/40 px-5 py-2.5 text-[13px] font-bold text-white"
              >
                See combos
              </a>
            </div>
          </div>
          <img
            src="/combos/seven-pack-lineup.png"
            alt="The Nuto range"
            className="hidden rounded-xl object-cover sm:block"
            width={1600}
            height={830}
          />
        </div>
      </section>}

      {!searchOnly && <TrustStrip />}

      {/* Combos — a main line, so they sit above the single flavours */}
      {!searchOnly && <div id="combos" className="border-b border-neutral-200 bg-white py-8">
        <Carousel
          title="Value packs & combos"
          subtitle="Buy a few at once and pay less than the packs cost separately."
          itemClassName="w-[15rem] sm:w-[17rem]"
        >
          {combos.map((combo) => (
            <ComboCard key={combo.slug} combo={combo} />
          ))}
        </Carousel>
      </div>}

      {/* Filters + grid */}
      <section id="range" className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {searchOnly ? (
            <div>
              <h1 className="text-xl font-extrabold sm:text-2xl">Search results</h1>
              {query && <p className="mt-1 text-[13px] text-neutral-500">Results for “{query}”</p>}
            </div>
          ) : (
            <h2 className="text-xl font-extrabold sm:text-2xl">Shop all flavours</h2>
          )}
          <label className="flex items-center gap-2 text-[13px]">
            <span className="text-neutral-500">Sort</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-[14px] focus:border-[#1B7A4B] focus:outline-none"
            >
              <option value="popular">Most popular</option>
              <option value="rating">Highest rated</option>
              <option value="heat-low">Mild to hot</option>
              <option value="heat-high">Hot to mild</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter flavours">
          {filters.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              aria-pressed={filter === option.key}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-[13px] font-medium transition-colors ${
                filter === option.key
                  ? 'border-[#1B7A4B] bg-[#1B7A4B] text-white'
                  : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-[13px] text-neutral-500" aria-live="polite">
          Showing {visible.length} of {flavours.length} flavours
        </p>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-neutral-500">
            Nothing matches “{query}”. Try “peri peri” or “masala”.
          </p>
        ) : (
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((flavour) => (
              <li key={flavour.slug}>
                <FlavourCard flavour={flavour} />
              </li>
            ))}
          </ul>
        )}
      </section>


      {/* Bestsellers rail */}
      {!searchOnly && <div className="border-y border-neutral-200 bg-white py-8">
        <Carousel
          title="Bestsellers"
          subtitle="What people reorder most."
          itemClassName="w-[10.5rem] sm:w-[13rem]"
        >
          {[...flavours]
            .sort((a, b) => b.reviewCount - a.reviewCount)
            .slice(0, 6)
            .map((flavour) => (
              <FlavourCard key={flavour.slug} flavour={flavour} />
            ))}
        </Carousel>
      </div>}

      {/* Reviews */}
      {!searchOnly && <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-xl font-extrabold sm:text-2xl">What people say</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Ordered the Peri Peri on a Friday, finished it by Sunday. Reordering.', 'Sneha K., Hyderabad'],
            ['Maggi Masala is exactly what it sounds like. My kids fight over it.', 'Rahul V., Pune'],
            ['Bought the All Eight box for Diwali gifting. Everyone asked where I got it.', 'Farhan A., Mumbai'],
          ].map(([quote, name]) => (
            <li key={name} className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="flex gap-0.5 text-[#F5A623]" aria-label="5 out of 5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
                    <path d="m12 2 3 6.5 7 .8-5.2 4.8 1.4 6.9L12 17.6 5.8 21l1.4-6.9L2 9.3l7-.8L12 2Z" />
                  </svg>
                ))}
              </div>
              <p className="mt-2 text-[13px]">{quote}</p>
              <p className="mt-2 text-[12px] text-neutral-500">{name}</p>
            </li>
          ))}
        </ul>
      </section>}

    </ShopLayout>
  );
}

/** Dedicated search view: results begin directly below the shared header. */
export function SearchResultsPage() {
  return <ShopV2Page searchOnly />;
}
