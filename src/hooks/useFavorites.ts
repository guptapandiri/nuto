import { useContext } from 'react';
import { FavoritesContext, type FavoritesContextValue } from '@/context/favorites-context';

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used inside <FavoritesProvider>.');
  }
  return context;
}
