import { createContext } from 'react';
import type { CatalogueItem } from '@/data/catalogue';

export interface FavoritesContextValue {
  favoriteSlugs: string[];
  favoriteItems: CatalogueItem[];
  favoriteCount: number;
  isFavorite: (slug: string) => boolean;
  toggleFavorite: (slug: string) => void;
  removeFavorite: (slug: string) => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);
