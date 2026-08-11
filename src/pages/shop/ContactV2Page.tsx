import { business, whatsappLink } from '@/data/business';
import { ShopLayout } from './ShopLayout';

export function ContactV2Page() {
  return (
    <ShopLayout>
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-[1fr_1fr] sm:py-14">
        <div className="self-center">
          <p className="text-[12px] font-bold tracking-[0.16em] text-[#1B7A4B] uppercase">Contact</p>
          <h1 className="mt-3 text-3xl leading-tight font-extrabold sm:text-5xl">Let&apos;s talk cashews.</h1>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-neutral-600">
            Need help with an order, a gifting request, or a question about the range? Reach
            out — WhatsApp is the quickest way to get us.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={whatsappLink('Hi Nuto, I have a question.')} target="_blank" rel="noreferrer" className="rounded-lg bg-[#1B7A4B] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#12351F]">
              WhatsApp us
            </a>
            <a href={`mailto:${business.email}`} className="rounded-lg border border-neutral-300 bg-white px-5 py-3 text-[13px] font-bold text-neutral-800 hover:border-neutral-900">
              Email us
            </a>
          </div>
          <dl className="mt-8 grid gap-4 text-[14px] sm:grid-cols-2">
            <div><dt className="font-bold">Phone</dt><dd className="mt-1 text-neutral-600">{business.phone}</dd></div>
            <div><dt className="font-bold">Based in</dt><dd className="mt-1 text-neutral-600">{business.city}, India</dd></div>
          </dl>
        </div>
        <img src="/combos/five-pack.png" alt="Five Nuto cashew canisters" className="w-full rounded-xl border border-neutral-200 bg-[#F6F2EC] object-cover" />
      </section>
    </ShopLayout>
  );
}
