/**
 * Derives per-SKU product images from the brand's existing Instagram creatives.
 *
 * These are STAND-INS. When real studio shots exist, drop them straight into
 * public/products/ with the same filenames and delete this script — no component
 * code references anything but the filenames.
 *
 * Run: node scripts/build-product-images.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const LINEUP = 'instagram/2026-03-13_DV1M1vviMNJ.jpg';
const EID = 'instagram/2026-03-21_DWIgieYCAGA.jpg';
const OUT = 'public/products';

// Output canvas. Portrait, since the product is a tall jar.
const W = 720;
const H = 1080;
// Matches the seamless studio backdrop in the lineup photograph, so the
// contain-padding is invisible against the crop.
const BACKDROP = { r: 234, g: 234, b: 232 };

/**
 * Crop windows against the 1080x1080 lineup photograph.
 *
 * The jars sit shoulder to shoulder with no background between them, so these
 * boundaries were found by scanning rows through the label band and reading the
 * colour transitions (kraft -> red -> magenta -> lime -> charcoal). Each window
 * is one jar plus its own hang tag, which overlaps the jar to its left.
 */
const TOP = 465;
const HEIGHT = 415;
const jars = [
  { slug: 'original', left: 40, width: 190 },
  { slug: 'fire', left: 230, width: 216 },
  { slug: 'velvet', left: 446, width: 200 },
  { slug: 'zest', left: 646, width: 200 },
  { slug: 'smoke', left: 846, width: 196 },
].map((j) => ({ ...j, top: TOP, height: HEIGHT }));

await mkdir(OUT, { recursive: true });

for (const { slug, ...window } of jars) {
  await sharp(LINEUP)
    .extract(window)
    .resize(W, H, { fit: 'contain', background: BACKDROP })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(`${OUT}/${slug}.jpg`);
  console.log(`${slug}.jpg`);
}

// Milk Choco only appears in the Eid creative, on a decorated backdrop, so it
// is cover-cropped rather than contain-padded.
await sharp(EID)
  .extract({ left: 318, top: 236, width: 464, height: 812 })
  .resize(W, H, { fit: 'cover' })
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(`${OUT}/milk-choco.jpg`);
console.log('milk-choco.jpg');

// The full lineup, used as the homepage hero and the gifting-box image.
await sharp(LINEUP)
  .extract({ left: 0, top: 380, width: 1080, height: 560 })
  .resize(1600, 830, { fit: 'cover' })
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(`${OUT}/lineup.jpg`);
console.log('lineup.jpg');

/**
 * Square card crops for the proposed range.
 *
 * The printed flavour name sits in the upper third of every jar and reads
 * ORIGINAL / FIRE / VELVET / ZEST / SMOKE — the OLD range. Cropping below it
 * keeps the viewing window, the nuts and the label colour while losing the
 * wrong word. Still a stand-in; still needs a reshoot.
 */
const cardSources = [
  { slug: 'original', left: 100, top: 555, size: 520 },
  { slug: 'fire', left: 100, top: 555, size: 520 },
  { slug: 'velvet', left: 100, top: 555, size: 520 },
  { slug: 'zest', left: 100, top: 555, size: 520 },
  { slug: 'smoke', left: 100, top: 555, size: 520 },
  // Milk Choco came from the Eid creative, which has a greeting card at the
  // bottom of frame. Crop higher and tighter so no card text creeps in.
  { slug: 'milk-choco', left: 130, top: 500, size: 450 },
];
await mkdir('public/cards', { recursive: true });
for (const { slug, left, top, size } of cardSources) {
  await sharp(`${OUT}/${slug}.jpg`)
    .extract({ left, top, width: size, height: size })
    .resize(640, 640)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(`public/cards/${slug}.jpg`);
  console.log(`cards/${slug}.jpg`);
}
