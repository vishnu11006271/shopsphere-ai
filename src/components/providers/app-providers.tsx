"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { useRecentlyViewedStore } from "@/features/recommendations/store/recently-viewed-store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false } },
  }));
  useEffect(() => {
    const syncPersistedStores = (event: StorageEvent) => {
      if (event.key === "shopsphere-cart") void useCartStore.persist.rehydrate();
      if (event.key === "shopsphere-wishlist") void useWishlistStore.persist.rehydrate();
      if (event.key === "shopsphere-recently-viewed") void useRecentlyViewedStore.persist.rehydrate();
    };
    window.addEventListener("storage", syncPersistedStores);
    return () => window.removeEventListener("storage", syncPersistedStores);
  }, []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
