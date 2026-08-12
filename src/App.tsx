import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { CartProvider } from '@/context/CartProvider';
import { FavoritesProvider } from '@/context/FavoritesProvider';
import { AccountProvider } from '@/context/AccountProvider';
import { FavoritesDrawer } from '@/components/favorites/FavoritesDrawer';
import { AccountDrawer } from '@/components/account/AccountDrawer';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { CartPage } from '@/pages/CartPage';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { OrderConfirmedPage } from '@/pages/OrderConfirmedPage';
import { PolicyPage } from '@/pages/PolicyPage';
import { ComboPage } from '@/pages/shop/ComboPage';
import { ContactV2Page } from '@/pages/shop/ContactV2Page';
import { FlavourPage } from '@/pages/shop/FlavourPage';
import { GiftingV2Page } from '@/pages/shop/GiftingV2Page';
import { SearchResultsPage, ShopV2Page } from '@/pages/shop/ShopV2Page';
import { StoryV2Page } from '@/pages/shop/StoryV2Page';

/*
 * The admin dashboard and the design concepts are lazy-loaded. Neither is ever
 * needed by a shopper, and bundling them made the storefront's entry chunk
 * roughly twice the size it needs to be.
 */
const AdminApp = lazy(() =>
  import('@/admin/AdminApp').then((m) => ({ default: m.AdminApp })),
);
const ConceptsIndex = lazy(() =>
  import('@/pages/concepts/ConceptsIndex').then((m) => ({ default: m.ConceptsIndex })),
);
const RoasteryConcept = lazy(() =>
  import('@/pages/concepts/RoasteryConcept').then((m) => ({ default: m.RoasteryConcept })),
);
const BlocksConcept = lazy(() =>
  import('@/pages/concepts/BlocksConcept').then((m) => ({ default: m.BlocksConcept })),
);
const GiftingConcept = lazy(() =>
  import('@/pages/concepts/GiftingConcept').then((m) => ({ default: m.GiftingConcept })),
);

function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center text-sm text-neutral-500">Loading…</div>
  );
}

export function App() {
  return (
    <CartProvider>
      <FavoritesProvider>
        <AccountProvider>
          <ScrollToTop />
          <Suspense fallback={<Loading />}>
            <Routes>
        {/*
         * Design concepts render bare — no site header, footer or cart — because
         * the whole point is that each one looks like a different company.
         */}
        {/* Admin renders bare — its own chrome, its own auth gate. */}
        <Route path="/admin" element={<AdminApp />} />

        <Route path="/concepts" element={<ConceptsIndex />} />
        <Route path="/concepts/roastery" element={<RoasteryConcept />} />
        <Route path="/concepts/blocks" element={<BlocksConcept />} />
        <Route path="/concepts/gifting" element={<GiftingConcept />} />

        {/*
         * The commerce storefront. This is the live front door — it carries its
         * own chrome, so it sits outside the Storefront wrapper below.
         */}
        <Route path="/" element={<ShopV2Page />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/shop" element={<ShopV2Page />} />
        <Route path="/gifting" element={<GiftingV2Page />} />
        <Route path="/story" element={<StoryV2Page />} />
        <Route path="/contact" element={<ContactV2Page />} />
        <Route path="/p/:slug" element={<FlavourPage />} />
        <Route path="/c/:slug" element={<ComboPage />} />
        {/* Kept so existing links and bookmarks do not break. */}
        <Route path="/shop-v2" element={<ShopV2Page />} />

        <Route path="*" element={<Storefront />} />
            </Routes>
          </Suspense>
          <FavoritesDrawer />
          <AccountDrawer />
        </AccountProvider>
      </FavoritesProvider>
    </CartProvider>
  );
}

/** The live storefront, with its full chrome. */
function Storefront() {
  return (
    <>
      <a href="#main" className="skip-link rounded bg-ink px-4 py-2 text-shell">
        Skip to content
      </a>

      <div className="flex min-h-dvh flex-col">
        <AnnouncementBar />
        <Header />

        <main id="main" className="flex-1">
          <Routes>
        {/* Retired catalogue pages now point to the current seven-flavour storefront. */}
        <Route path="/legacy" element={<Navigate to="/" replace />} />
        <Route path="/product/:slug" element={<Navigate to="/" replace />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmed" element={<OrderConfirmedPage />} />
            <Route path="/policies/:slug" element={<PolicyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
      </div>

      <CartDrawer />
    </>
  );
}
