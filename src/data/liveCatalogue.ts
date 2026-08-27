import { apiUrl } from '@/lib/api';
import { combos, type Combo } from './combos';
import { rebuildCatalogue } from './catalogue';
import { flavours, packSizes, type Flavour, type HeatLevel, type PackSize } from './range';

interface ApiFlavour {
  slug: string; name: string; note: string; blurb: string; accent: string;
  heat: number; image: string; rating: number; reviewCount: number;
  variants: { grams: number; stock: number }[];
}
interface ApiCombo {
  slug: string; name: string; tagline: string; description: string;
  priceInPaise: number; image: string; badge: string | null; stock: number;
  items: { flavourSlug: string; grams: number; quantity: number }[];
}
interface ApiCatalogue {
  flavours: ApiFlavour[];
  packSizes: { grams: number; priceInPaise: number }[];
  combos: ApiCombo[];
}

/** Loads the database catalogue, retaining bundled data as an offline fallback. */
export async function syncLiveCatalogue(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl('/api/catalog'));
    if (!response.ok) return false;
    const data = await response.json() as ApiCatalogue;
    if (!Array.isArray(data.flavours) || !Array.isArray(data.packSizes) || !Array.isArray(data.combos)) return false;

    const liveFlavours: Flavour[] = data.flavours.map((item) => ({
      slug: item.slug, name: item.name, note: item.note, blurb: item.blurb,
      accent: item.accent, heat: Math.max(0, Math.min(3, item.heat)) as HeatLevel,
      image: item.image, rating: item.rating, reviewCount: item.reviewCount,
      variants: item.variants,
    }));
    const liveSizes: PackSize[] = data.packSizes.map((item) => ({
      grams: item.grams, priceInPaise: item.priceInPaise,
    }));
    const liveCombos: Combo[] = data.combos.map((item) => ({
      slug: item.slug, name: item.name, tagline: item.tagline,
      description: item.description, priceInPaise: item.priceInPaise,
      image: item.image, ...(item.badge ? { badge: item.badge } : {}),
      inStock: item.stock > 0, items: item.items,
    }));

    flavours.splice(0, flavours.length, ...liveFlavours);
    packSizes.splice(0, packSizes.length, ...liveSizes);
    combos.splice(0, combos.length, ...liveCombos);
    rebuildCatalogue();
    return true;
  } catch {
    return false;
  }
}
