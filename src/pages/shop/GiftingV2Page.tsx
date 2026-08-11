import { Carousel } from '@/components/ui/Carousel';
import { combos } from '@/data/combos';
import { whatsappLink } from '@/data/business';
import { ComboCard } from './ComboCard';
import { ShopLayout, TrustStrip } from './ShopLayout';

export function GiftingV2Page() {
  return (
    <ShopLayout>
      <section className="border-b border-neutral-200 bg-[#F6F2EC]">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:grid-cols-2 sm:py-14">
          <div>
            <p className="text-[12px] font-bold tracking-[0.16em] text-[#1B7A4B] uppercase">Gifting</p>
            <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">
              A better thing to turn up with.
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-neutral-600">
              For festivals, wedding returns, housewarmings and the office order that needs to
              feel considered. Pick a pack, then let us handle the rest.
            </p>
            <a
              href={whatsappLink('Hi Nuto, I would like help with a gifting order.')}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-lg bg-[#1B7A4B] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#12351F]"
            >
              Plan a gifting order
            </a>
          </div>
          <img
            src="/combos/seven-pack-lineup.png"
            alt="Seven Nuto cashew canisters ready for gifting"
            className="w-full rounded-xl border border-neutral-200 bg-white object-cover"
          />
        </div>
      </section>

      <section className="py-9">
        <Carousel
          title="Ready-to-gift packs"
          subtitle="Choose a combination, then add it straight to your cart."
          itemClassName="w-[15rem] sm:w-[17rem]"
        >
          {combos.map((combo) => <ComboCard key={combo.slug} combo={combo} />)}
        </Carousel>
      </section>

      <section className="border-y border-neutral-200 bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3">
          {[
            ['For a few people', 'Start with a three-pack — small, generous and easy to share.', '/combos/three-pack.png'],
            ['For the office', 'Five current flavours, packed as one thoughtful desk-side gift.', '/combos/five-pack.png'],
            ['For the whole room', 'The seven-flavour lineup, made for proper celebrations.', '/combos/seven-pack-lineup.png'],
          ].map(([title, body, image]) => (
            <article key={title} className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50">
              <img src={image} alt="" className="aspect-[4/3] w-full object-cover" loading="lazy" />
              <div className="p-4">
                <h2 className="text-[15px] font-bold">{title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-neutral-600">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <TrustStrip />
    </ShopLayout>
  );
}
