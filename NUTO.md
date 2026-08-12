# Nuto — everything known

A single dump of what is actually known about this business, written 27 July 2026.

**Read the provenance labels.** A lot of what is currently on the website was written by me as placeholder copy and reads as though it were fact. Sections below are tagged:

- 🟢 **VERIFIED** — observed directly from the Instagram API, the supplied logo file, or the product photography.
- 🟡 **STATED** — told to me by the owner in conversation. Not independently checked.
- 🔴 **INVENTED** — I made it up to fill the layout. **Not true unless someone confirms it.**

`BRAND.md` is the narrower design/implementation reference for the storefront. This file is the broader picture.

---

## 1. The business

| | | |
| --- | --- | --- |
| Name | Nuto, stylised **Nūto** | 🟢 |
| Tagline | *Flavor in every fold* | 🟢 |
| Category | Flavoured cashews | 🟢 |
| Base | Hyderabad, Telangana | 🟢 |
| Market | India | 🟡 |
| Launch announced | 1 April 2026 | 🟢 |
| Contact number | +91 99495 04441 | 🟡 |
| Website before this build | None | 🟡 |

🟢 Positioning as expressed in their own launch captions: gifting, hosting, festivals, "snacking should be an experience, not an afterthought."

---

## 2. Instagram — [@nutoproducts](https://www.instagram.com/nutoproducts/) 🟢

Pulled from Instagram's public web API on 27 July 2026.

| | |
| --- | --- |
| Followers | 33 |
| Following | 12 |
| Posts | 6 |
| Bio | *empty* |
| Display name | *empty* |
| Link in bio | *none* |
| Account type | Personal — not business/professional |
| Verified | No |
| Last post | 2 April 2026 |

### The six posts

| Date | Likes | Content |
| --- | --- | --- |
| 13 Mar 2026 | 22 | Five-jar lineup, flavour list, launch copy |
| 17 Mar 2026 | 14 | Ugadi & Ramadan — "GRAND LAUNCH: APRIL 1st", tube packaging |
| 19 Mar 2026 | 13 | Ugadi greeting, Telugu — "our own Hyderabad brand" |
| 21 Mar 2026 | 10 | Eid Mubarak, Milk Chocolate Cashews, gifting angle |
| 27 Mar 2026 | 14 | Sri Rama Navami greeting, Telugu |
| 2 Apr 2026 | 8 | Hanuman Jayanti greeting, Telugu, "guilt-free desserts" |

### What the numbers say

- Engagement fell 22 → 8 across three weeks as content drifted from product to generic festival greetings.
- One comment across all six posts.
- **Dormant for roughly four months** as of this writing.
- **No conversion path.** No bio, no link, no contact, not a business account. Someone who wants to buy has nowhere to go. This is the single biggest fixable problem, and it is free to fix.
- Copy contradicted itself across posts — "guilt-free desserts", "pure indulgence", "healthy snacking". No settled position.
- Language splits by festival: Telugu for Hindu festivals, English for Eid and product posts.
- Hashtags mix real ones (`#flavouredcashews`, `#premiumsnacks`) with junk stylised ones (`#ɴᴇᴡᴘᴏsᴛ`, `#trendingpost`).

Post images were downloaded to `instagram/`, named `<date>_<shortcode>.jpg`.

> Reproducible without login:
> `curl -H "X-IG-App-ID: 936619743392459" "https://www.instagram.com/api/v1/users/web_profile_info/?username=nutoproducts"`

---

## 3. Identity 🟢

From the logo artwork supplied by the owner (`brand/nuto-logo-source.svg`).

Wordmark "Nūto", where the **ū** is a whole cashew with a green leaf on top. Tagline sits beneath.

| Colour | Hex | Role |
| --- | --- | --- |
| Slate | `#3A4149` | Letterforms, body text |
| Cashew copper | `#C7894E` | The nut — primary accent |
| Copper shadow | `#8E5528`–`#A2632E` | Nut shading |
| Copper highlight | `#E6AF74`–`#FACD9A` | Nut highlight |
| Leaf green | `#879551` / `#A7B55E` | The leaf |
| Off-white | `#FDFDFC` | Background |

The source file has an opaque white background rect baked in, which shows as a white box on any tinted surface. Two derived transparent variants are in `public/`: `nuto-logo.svg` (full lockup) and `nuto-wordmark.svg` (wordmark only, cropped via viewBox).

### Packaging 🟢

Kraft-paper and clear-glass jars with **wooden lids**, wrapped with twine and a kraft hang-tag reading "Thank You for your purchase". Cylindrical kraft tubes also appear in the Ugadi/Ramadan creative. Labels carry the green vegetarian mark and a viewing window shaped like a cashew.

---

## 4. Products

### 4a. What the launch photography shows 🟢

The six SKUs visible on actual jars in the March/April posts:

| Name | Label text | Net weight |
| --- | --- | --- |
| Original | Himalayan pink salt cashews | 250g |
| Fire | Chilli | 250g |
| Velvet | Chocolate sea salt cashews | 250g |
| Zest | Lime & chilli cashews | 250g |
| Smoke | Hickory smoked cashews | 230g |
| Milk Choco | Milk chocolate cashews | 200g |

**This is what `/legacy` still sells.** The live front door has moved to the range in §4b.

### 4b. What the owner says the range will be 🟡

Given 27 July 2026. **This is what the live site now sells**, as 8 flavours × 3 sizes = 24 buyable variants.

**Eight flavours:** Sweet chilli · Lemon chilli · Black pepper · Masala · Peri peri · Maggi masala · Salted · Chilli

Sold both as single packs and as **6 combos** — Taster Box, Everyday Trio, Heat Seeker, Office Pack, Family Pack, Party Pack — which are a main line rather than a gifting sideline, each its own SKU with its own price. 🔴 The combo line-up and its prices are invented; only the three single-pack prices below came from the owner.

**Three pack sizes, priced by size:**

| Size | Price | Per gram |
| --- | --- | --- |
| 50g | ₹79 | ₹1.58 |
| 100g | ₹149 | ₹1.49 |
| 200g | ₹299 | ₹1.50 |

### 4c. What changes between 4a and 4b

This is a full replacement, not an edit:

- **Zero overlap in flavour names.** All six current SKUs disappear.
- **Both chocolate products are gone** (Velvet, Milk Choco). No photography exists for any of the eight new flavours; the live cards are square crops of the old jars, taken below the printed name so the wrong word is not visible. Four source jars cover eight flavours, so there is visible repetition. Reshoot before launch.
- **Price point drops hard.** Current site: ₹649–799 for one 250g jar. New: ₹299 for 200g. That is roughly ₹2.60/g down to ₹1.50/g — a different market segment, and it sits awkwardly against the "premium gifting" positioning the brand's own captions established.
- **Data model changed shape.** Cart lines are now keyed by a composite `flavour-grams` slug, resolved through `src/data/catalogue.ts`, which also still serves the legacy jars.
- **Bulk pricing is nearly flat.** 100g at ₹1.49/g and 200g at ₹1.50/g means the big pack is very slightly *worse* value per gram than the medium. Buyers who do the maths will stop at 100g. Worth a look before printing labels.

---

## 5. 🔴 What is fiction on the current site

I wrote all of the following to make the layout real. **None of it came from the owner.** It reads convincingly, which is exactly the danger — if this goes live unreviewed, the brand is making specific factual claims about its own product that may be false, some of them regulated.

| Fiction | Where | Risk if published unchecked |
| --- | --- | --- |
| All prices (₹649–799) | `src/data/products.ts` | Superseded by §4b anyway |
| "Whole W240 grade" cashews | product copy, homepage | A specific graded claim about the raw material |
| Ingredient lists — Guntur chilli, Kashmiri chilli, 54% cocoa, black salt, curry leaf, jaggery… | `src/data/products.ts` | **Ingredient declarations are regulated.** Wrong lists are a labelling offence |
| Allergen statements | product pages | **Safety-critical.** Currently derived from my invented ingredient lists |
| "Dry-roasted not fried", "cold-smoked over hickory", "small batches" | product + homepage copy | Process claims about a kitchen I have never seen |
| Registered address & legal entity name | `src/data/business.ts` | Legally required |
| `hello@nuto.in` | footer, contact, order confirmation | Mailbox probably does not exist — confirmation emails would bounce |
| Free shipping ₹499 / ₹69 flat / ₹39 COD | `src/data/business.ts` | Never checked against real courier rates |
| The entire brand story on `/story` | `src/pages/StoryPage.tsx` | "It started with a bad jar of cashews" — I invented this origin |
| All four policy documents | `src/data/policies.ts` | Drafted, never legally reviewed |

Every one of these sits behind a `PLACEHOLDER` comment block in the source. The two data files carry warnings at the top.

---

## 6. The website as built

React 19 + TypeScript (strict) + Tailwind v4 + React Router 7, on Vite. Frontend only — no server, no database, no payment gateway. Static `dist/`, needs a SPA rewrite so deep links don't 404.

**Routes.** `/` is the commerce storefront — search, filter chips, sort, ratings, discount badges, per-card pack-size selectors, ADD buttons that become quantity steppers, combos, reviews, sticky mobile cart bar. `/p/:slug` is the flavour page and `/c/:slug` the combo page, with a pack-size selector, PIN-code delivery check, offers and accordions. Cart, checkout, order confirmation, contact and the four policy pages are shared. The earlier marketing-led storefront is preserved at `/legacy`; three rejected design concepts sit at `/concepts`.

The cart resolves through `src/data/catalogue.ts`, which covers both the legacy single-size jars and all 24 flavour × size variants, so one cart and one checkout serve both.

**Built for India specifically:** ₹ with lakh/crore grouping; money as integer paise throughout; address form with all 28 states + 8 UTs; mobile validated as 10 digits starting 6–9; PIN validated as 6 digits not starting 0; COD as a first-class option with its fee shown before commitment; FSSAI number, green veg mark and net weight displayed; WhatsApp support link; 16px inputs so iOS Safari doesn't zoom on focus.

**Verified, not assumed.** `scripts/smoke-test.mjs` drives real Chrome through the whole purchase flow over CDP — 11 checks, all passing, no console errors. All 9 pages probed for horizontal overflow at 360/390/768/1280px: none.

**Product imagery is derived, not shot.** `scripts/build-product-images.mjs` crops five jars out of the lineup photograph and Milk Choco out of the Eid creative. The jars touch in that photo with no background between them, so crop boundaries were found by scanning rows through the label band and reading colour transitions. These are stand-ins; real shots drop into `public/products/` under the same filenames with no code change.

---

## 7. Open questions

1. **Does the §4b range replace §4a, or sit alongside it?** Everything downstream depends on this.
2. **Is the premium positioning still the plan** at ₹1.50/g? The brand's own captions sell gifting and indulgence; the new pricing is everyday-snack territory.
3. **Real ingredient and allergen lists** for whichever range ships. Not optional, not something I can invent.
4. **Registered address.**
5. **A working email address**, or drop email from the order flow and run support on WhatsApp only.
6. **Payment gateway** — Razorpay needs a registered entity, KYC and a bank account. Is that in place? The seam is documented in `src/lib/payment.ts`.
7. **Where do orders go?** Right now an order exists only in the customer's browser history. COD orders need a destination before the first real sale.
8. **Real product photography** for the new flavours.

---

## 8. Immediate free wins

Independent of the site, and worth doing this week:

1. Put a bio, a link and a contact method on the Instagram account. Convert it to a Business account.
2. Pick one positioning line and stop contradicting it.
3. Start posting again — four months of silence has cost whatever momentum the launch built.
