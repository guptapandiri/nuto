import { createContext } from 'react';
import type { CartLine, ResolvedCartLine } from '@/types';

export interface CartContextValue {
  lines: CartLine[];
  /** Cart lines joined to the catalogue, in the order they were added. */
  resolvedLines: ResolvedCartLine[];
  itemCount: number;
  subtotalInPaise: number;
  addItem: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

/**
 * Undefined default so `useCart` can throw a useful error when a component is
 * rendered outside the provider, rather than silently reading an empty cart.
 */
export const CartContext = createContext<CartContextValue | undefined>(undefined);
