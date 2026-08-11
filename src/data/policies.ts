import { business, commerce } from './business';
import { formatPaiseCompact } from '@/lib/money';

export interface Policy {
  slug: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}

/**
 * PLACEHOLDER POLICY COPY — REVIEW BEFORE LAUNCH.
 * These read as real policies so the pages are testable and the checkout links
 * resolve, but they are not legal advice and have not been reviewed. Indian
 * payment gateways require published shipping, returns, privacy and terms pages
 * before they will activate an account, so these need genuine sign-off.
 */
export const policies: Policy[] = [
  {
    slug: 'shipping',
    title: 'Shipping policy',
    updated: '2026-07-27',
    sections: [
      {
        heading: 'Where we ship',
        body: [
          `We ship to all serviceable PIN codes across India from our kitchen in ${business.city}. We do not ship internationally at this time.`,
        ],
      },
      {
        heading: 'Charges',
        body: [
          `Shipping is free on orders over ${formatPaiseCompact(commerce.freeShippingThresholdInPaise)}. Below that, a flat charge of ${formatPaiseCompact(commerce.flatShippingInPaise)} applies.`,
          `Cash on Delivery orders carry an additional handling fee of ${formatPaiseCompact(commerce.codFeeInPaise)}.`,
        ],
      },
      {
        heading: 'Dispatch and delivery',
        body: [
          'Orders are packed and dispatched within 2 working days. You will receive a tracking link by email and SMS once your parcel leaves us.',
          'Delivery usually takes 3 to 6 working days depending on your location. Remote PIN codes may take longer.',
        ],
      },
      {
        heading: 'Delivery attempts',
        body: [
          'Our courier partners make up to three delivery attempts. If all three fail, the parcel returns to us and we will contact you to arrange a re-dispatch or a refund, minus the shipping already incurred.',
        ],
      },
    ],
  },
  {
    slug: 'returns',
    title: 'Returns & refunds',
    updated: '2026-07-27',
    sections: [
      {
        heading: 'Food safety comes first',
        body: [
          'Because our products are sealed food items, we cannot accept returns of opened jars. This protects every customer, not just you.',
        ],
      },
      {
        heading: 'When we will replace or refund',
        body: [
          'If your order arrives damaged, leaking, broken, past its best-before date, or is simply the wrong item, we will replace it or refund you in full.',
          'Tell us within 48 hours of delivery and include photographs of the parcel and the jar. That is usually all we need.',
        ],
      },
      {
        heading: 'How refunds are issued',
        body: [
          'Approved refunds go back to the original payment method within 5 to 7 working days. For Cash on Delivery orders we refund by bank transfer or UPI to an account in your name.',
        ],
      },
      {
        heading: 'Cancellations',
        body: [
          'You can cancel any order before it is dispatched for a full refund. Once the parcel is with the courier we cannot cancel it.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy policy',
    updated: '2026-07-27',
    sections: [
      {
        heading: 'What we collect',
        body: [
          'To fulfil an order we collect your name, delivery address, mobile number and email address. If you pay online, the payment is handled by our payment provider — we never see or store your card or UPI details.',
        ],
      },
      {
        heading: 'Why we collect it',
        body: [
          'Solely to process, pack, deliver and support your order, and to contact you about it. We will only send you marketing messages if you have asked us to.',
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'Your delivery details are shared with our courier partner so they can deliver your parcel. We do not sell your data to anyone, for any reason.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          `You can ask us for a copy of the data we hold about you, ask us to correct it, or ask us to delete it. Write to ${business.email} and we will action it.`,
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms & conditions',
    updated: '2026-07-27',
    sections: [
      {
        heading: 'About these terms',
        body: [
          `These terms govern your use of this website and any order you place with ${business.legalName}. By placing an order you accept them.`,
        ],
      },
      {
        heading: 'Pricing',
        body: [
          'All prices are in Indian Rupees and inclusive of applicable taxes. We may change prices at any time, but never after you have placed an order.',
          'If a product is listed at an obviously incorrect price, we may cancel the order and refund you in full rather than fulfil it.',
        ],
      },
      {
        heading: 'Product information',
        body: [
          'We describe our products as accurately as we can. Photographs are representative; natural products vary in colour and size between batches.',
          'All our products contain tree nuts and are packed in a facility that handles tree nuts. Please read the allergen information on each product page before ordering.',
        ],
      },
      {
        heading: 'Governing law',
        body: [
          `These terms are governed by the laws of India. Any dispute is subject to the exclusive jurisdiction of the courts in ${business.address.city}, ${business.address.state}.`,
        ],
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return policies.find((policy) => policy.slug === slug);
}
