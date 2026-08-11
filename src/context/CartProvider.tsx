import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { commerce } from '@/data/business';
import { getCatalogueItem } from '@/data/catalogue';
import type { CartLine, ResolvedCartLine } from '@/types';
import { CartContext, type CartContextValue } from './cart-context';

const STORAGE_KEY = 'nuto.cart.v1';

type CartAction =
  | { type: 'add'; slug: string; quantity: number }
  | { type: 'set'; slug: string; quantity: number }
  | { type: 'remove'; slug: string }
  | { type: 'clear' }
  | { type: 'hydrate'; lines: CartLine[] };

function clampQuantity(quantity: number): number {
  return Math.max(1, Math.min(commerce.maxQuantityPerLine, Math.floor(quantity)));
}

function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'hydrate':
      return action.lines;

    case 'add': {
      const existing = state.find((line) => line.slug === action.slug);
      if (!existing) {
        return [...state, { slug: action.slug, quantity: clampQuantity(action.quantity) }];
      }
      return state.map((line) =>
        line.slug === action.slug
          ? { ...line, quantity: clampQuantity(line.quantity + action.quantity) }
          : line,
      );
    }

    case 'set': {
      // Setting a quantity below 1 is how the stepper removes a line.
      if (action.quantity < 1) {
        return state.filter((line) => line.slug !== action.slug);
      }
      return state.map((line) =>
        line.slug === action.slug
          ? { ...line, quantity: clampQuantity(action.quantity) }
          : line,
      );
    }

    case 'remove':
      return state.filter((line) => line.slug !== action.slug);

    case 'clear':
      return [];
  }
}

/**
 * Reads persisted cart lines, discarding anything that no longer matches the
 * catalogue — otherwise a renamed or withdrawn SKU would sit in the cart
 * forever and break the totals.
 */
function readStoredCart(): CartLine[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== 'object' || entry === null) return [];
      const { slug, quantity } = entry as Partial<CartLine>;
      if (typeof slug !== 'string' || typeof quantity !== 'number') return [];
      if (!getCatalogueItem(slug)) return [];
      return [{ slug, quantity: clampQuantity(quantity) }];
    });
  } catch {
    // Corrupt or unavailable storage (private mode, quota) — start empty.
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isHydrated, setHydrated] = useState(false);

  // Hydrate once on mount rather than in the reducer's initial state, so the
  // first render is deterministic.
  useEffect(() => {
    dispatch({ type: 'hydrate', lines: readStoredCart() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return; // don't overwrite storage with the pre-hydration empty cart
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Storage full or blocked — the cart still works for this session.
    }
  }, [lines, isHydrated]);

  const resolvedLines = useMemo<ResolvedCartLine[]>(
    () =>
      lines.flatMap((line) => {
        const product = getCatalogueItem(line.slug);
        if (!product) return [];
        return [
          {
            slug: product.slug,
            name: product.name,
            image: product.image,
            weightGrams: product.weightGrams,
            unitPriceInPaise: product.priceInPaise,
            quantity: line.quantity,
            lineTotalInPaise: product.priceInPaise * line.quantity,
            inStock: product.inStock,
          },
        ];
      }),
    [lines],
  );

  const addItem = useCallback((slug: string, quantity = 1) => {
    dispatch({ type: 'add', slug, quantity });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    dispatch({ type: 'set', slug, quantity });
  }, []);

  const removeItem = useCallback((slug: string) => {
    dispatch({ type: 'remove', slug });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      resolvedLines,
      itemCount: resolvedLines.reduce((sum, line) => sum + line.quantity, 0),
      subtotalInPaise: resolvedLines.reduce((sum, line) => sum + line.lineTotalInPaise, 0),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [
      lines,
      resolvedLines,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      isDrawerOpen,
      openDrawer,
      closeDrawer,
    ],
  );

  return <CartContext value={value}>{children}</CartContext>;
}
