import { Link } from 'react-router';
import { flavours } from '@/data/range';
import { ShopLayout, TrustStrip } from './ShopLayout';

export function StoryV2Page() {
  return (
    <ShopLayout>
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1fr_1.15fr] sm:py-14">
          <div className="self-center">
            <p className="text-[12px] font-bold tracking-[0.16em] text-[#1B7A4B] uppercase">Our story</p>
            <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">
              Flavour is never an afterthought.
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-neutral-600">
              Nuto began with a simple idea: a cashew should still taste like a cashew. We
              build every flavour around the nut, then make the seasoning worth coming back to.
            </p>
            <Link to="/shop" className="mt-6 inline-flex rounded-lg bg-[#1B7A4B] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#12351F]">
              Shop the current range
            </Link>
          </div>
          <img
            src="/combos/seven-pack-lineup.png"
            alt="The current Nuto cashew canister lineup"
            className="w-full rounded-xl border border-neutral-200 bg-[#F6F2EC] object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="text-2xl font-extrabold">The current range</h2>
        <p className="mt-1 text-[14px] text-neutral-500">Seven flavours. One good reason to keep reaching for another handful.</p>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {flavours.map((flavour) => (
            <li key={flavour.slug}>
              <Link to={`/p/${flavour.slug}`} className="block overflow-hidden rounded-xl border border-neutral-200 bg-white hover:shadow-md">
                <img src={flavour.image} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                <p className="p-2.5 text-[13px] font-bold">{flavour.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <TrustStrip />
    </ShopLayout>
  );
}
