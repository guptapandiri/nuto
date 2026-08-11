# Nuto — brand reference

Everything the storefront is built on. If a fact about the brand is used in code, it should also be written down here.

---

## The business

|  |  |
| --- | --- |
| Name | Nuto (stylised **Nūto**) |
| Tagline | *Flavor in every fold* |
| Category | Premium flavoured cashews |
| Base | Hyderabad, Telangana, India |
| Market | India (D2C, shipping nationwide) |
| Launch | Announced for 1 April 2026 |
| Instagram | [@nutoproducts](https://www.instagram.com/nutoproducts/) |

**Positioning.** Gifting, hosting, and "snacking as an experience" — deliberately not everyday munching. The competitive claim is grade and process: whole W240 cashews, dry-roasted rather than fried, so flavour comes from the nut and the spice rather than from oil and seasoning dust.

---

## Identity

The logo is `brand/nuto-logo-source.svg` — the original supplied artwork, which has an opaque white background baked in. Two derived variants are what the site actually uses:

| File | Use |
| --- | --- |
| `public/nuto-logo.svg` | Full lockup, wordmark + tagline, transparent. Footer. |
| `public/nuto-wordmark.svg` | Wordmark only (cropped via `viewBox`), transparent. Header. |
| `public/favicon.svg` | Browser tab icon. |

Both variants are generated from the source by stripping the background rect. If the source logo is ever replaced, regenerate them rather than editing by hand.

### Palette

Sampled from the logo artwork, then adjusted where contrast demanded it. Defined as design tokens in `src/index.css`.

| Token | Value | Use |
| --- | --- | --- |
| `--color-ink` | `#3A4149` | Body text, primary buttons, header |
| `--color-cashew` | `#C7894E` | Primary accent — the cashew in the logo |
| `--color-cashew-deep` | `#A2632E` | Links, eyebrows, focus rings |
| `--color-leaf` | `#879551` | The leaf in the logo |
| `--color-shell` | `#FDFDFC` | Page background |
| `--color-sand` | `#F6F2EC` | Alternating section background |

**Flavour accents.** Each SKU carries its jar-label colour. Two were darkened from the true label values because white text on the originals failed 4.5:1 — the kraft of Original and the lime of Zest. If you restore the true label colours, switch those chips to dark text.

### Type

- **Display** — Fraunces (serif), used for headings and the logo's character.
- **Body** — Inter (sans).

Both loaded from Google Fonts in `index.html`.

---

## Products

Six SKUs. Names, weights and flavour descriptions come from the actual jar labels in the launch photography.

| Slug | Name | Flavour | Net weight | Profile |
| --- | --- | --- | --- | --- |
| `original` | Original | Himalayan pink salt | 250g | Savoury |
| `fire` | Fire | Chilli roasted | 250g | Spicy |
| `velvet` | Velvet | Chocolate sea salt | 250g | Sweet |
| `zest` | Zest | Lime & chilli | 250g | Spicy |
| `smoke` | Smoke | Hickory smoked | 230g | Savoury |
| `milk-choco` | Milk Choco | Milk chocolate cashews | 200g | Sweet |

All are vegetarian and carry the green FSSAI veg mark. All contain tree nuts; the two chocolate SKUs also contain milk.

Defined in `src/data/products.ts`. Gift boxes — enquiry-only for now — are in `src/data/giftBoxes.ts`.

### Imagery

There is no per-SKU studio photography yet. Every product image is derived from two Instagram creatives by `scripts/build-product-images.mjs`:

- Five jars cropped out of the launch lineup shot (`instagram/2026-03-13_DV1M1vviMNJ.jpg`). The jars touch each other in that photo with no background between them, so the crop windows were found by scanning rows through the label band and reading the colour transitions — not by eye.
- Milk Choco cropped from the Eid creative (`instagram/2026-03-21_DWIgieYCAGA.jpg`).

**These are stand-ins.** When real product shots exist, drop them into `public/products/` under the same filenames and delete the script. No component code needs to change.

---

## Voice

Plain, confident, slightly dry. Short sentences. Specific claims over adjectives — "whole W240, dry-roasted" beats "premium quality". Never gushing, never exclamation marks.

The launch Instagram copy contradicted itself across posts — "guilt-free desserts" in one, "pure indulgence" in the next, "healthy snacking" in a third. The site deliberately picks one line and holds it: **this is a treat, made properly.** Not health food.

Hindi/Telugu is fine for festival campaigns; the site itself is in English, which is what the checkout and courier flow assume.

---

## Compliance (India)

Non-negotiable for a food business selling online here:

- **FSSAI licence number** displayed in the footer and on every product page. Currently a placeholder — see the warning block in `src/data/business.ts`.
- **Green veg mark** on product cards and product pages.
- **Net weight in grams** displayed prominently (Legal Metrology).
- **Allergen declaration** — tree nuts on every SKU, plus milk on the chocolate ones.
- **Published policies** — shipping, returns, privacy, terms. Indian payment gateways will not activate an account without them. Draft copy is in `src/data/policies.ts` and has *not* been legally reviewed.

---

## Known gaps

Carried forward from the Instagram audit, still open:

1. **Prices are invented.** Every figure in `products.ts` and `giftBoxes.ts` is a placeholder.
2. **Legal details are invented.** FSSAI number, registered address and email are still placeholders in `business.ts`. The contact number (+91 99495 04441) is real.
3. **No payment gateway.** See the seam documented in `src/lib/payment.ts`.
4. **The Instagram account is still unconfigured** — no bio, no link, not a business account. Once this site is live it needs to go in the bio; that is currently the only distribution channel.
