import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCatalogueItem } from '@/data/catalogue';
import { FavoritesContext, type FavoritesContextValue } from './favorites-context';

const STORAGE_KEY = 'nuto.favorites.v1';

function readStoredFavorites(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return [...new Set(parsed.filter((slug): slug is string =>
      typeof slug === 'string' && Boolean(getCatalogueItem(slug)),
    ))];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavoriteSlugs(readStoredFavorites());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteSlugs));
    } catch {
      // Storage may be unavailable; favorites still work for this session.
    }
  }, [favoriteSlugs, isHydrated]);

  const isFavorite = useCallback(
    (slug: string) => favoriteSlugs.includes(slug),
    [favoriteSlugs],
  );

  const toggleFavorite = useCallback((slug: string) => {
    if (!getCatalogueItem(slug)) return;
    setFavoriteSlugs((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }, []);

  const removeFavorite = useCallback((slug: string) => {
    setFavoriteSlugs((current) => current.filter((item) => item !== slug));
  }, []);

  const favoriteItems = useMemo(
    () => favoriteSlugs.flatMap((slug) => {
      const item = getCatalogueItem(slug);
      return item ? [item] : [];
    }),
    [favoriteSlugs],
  );

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteSlugs,
      favoriteItems,
      favoriteCount: favoriteItems.length,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      favoriteSlugs,
      favoriteItems,
      isFavorite,
      toggleFavorite,
      removeFavorite,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );

  return <FavoritesContext value={value}>{children}</FavoritesContext>;
}
