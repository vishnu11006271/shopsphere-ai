"use client";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRecentlyViewedStore } from "../store/recently-viewed-store";
import { useSearchHistoryStore } from "@/features/search/store/search-history-store";
import { useWishlistStore } from "@/features/wishlist/store/wishlist-store";
import { useCartStore } from "@/store/cart-store";
import { useCheckoutStore } from "@/features/checkout/store/checkout-store";
import { useRecommendationPreferencesStore } from "../store/recommendation-preferences-store";
import type { RecommendationSignalKey } from "../types";

const labels: Record<RecommendationSignalKey, string> = {
  recentlyViewed: "Recently viewed products",
  searchHistory: "Recent searches",
  categoryInterest: "Category interest",
  tagInterest: "Product tags",
  priceRange: "Typical price range",
  ratingPreference: "Product ratings",
  wishlist: "Wishlist items",
  cart: "Cart contents",
  purchases: "Previous orders",
  brandPreference: "Brand preference",
};
export function RecommendationPreferencesPanel() {
  const entries = useRecentlyViewedStore((state) => state.entries);
  const clearViewed = useRecentlyViewedStore((state) => state.clear);
  const searches = useSearchHistoryStore((state) => state.searches);
  const clearSearches = useSearchHistoryStore((state) => state.clear);
  const wishlistCount = useWishlistStore((state) => state.productIds.length);
  const cartLines = useCartStore((state) => state.items);
  const cartCount = cartLines.length;
  const orders = useCheckoutStore((state) => state.orders);
  const enabled = useRecommendationPreferencesStore((state) => state.enabledSignals);
  const setEnabled = useRecommendationPreferencesStore((state) => state.setSignalEnabled);
  const reset = useRecommendationPreferencesStore((state) => state.reset);
  const prices = useMemo(
    () => [
      ...(enabled.recentlyViewed ? entries.map((entry) => entry.product.price) : []),
      ...(enabled.cart ? cartLines.map((line) => line.product.price) : []),
    ],
    [entries, cartLines, enabled.recentlyViewed, enabled.cart],
  );
  const range = prices.length
    ? {
        min: Math.min(...prices) * 85,
        max: Math.max(...prices) * 85,
        average: (prices.reduce((sum, value) => sum + value, 0) / prices.length) * 85,
      }
    : null;
  const resetHistory = () => {
    clearViewed();
    clearSearches();
    reset();
  };
  return (
    <section
      id="recommendation-preferences"
      className="mt-6 rounded-3xl bg-white p-6 shadow-soft sm:p-8"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Personalization controls
          </p>
          <h2 className="mt-2 text-xl font-semibold">Recommendation Preferences</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            See which signals shape your product suggestions. You can turn individual
            signals off or reset browsing and search history.
          </p>
        </div>
        <Button variant="secondary" onClick={resetHistory}>
          Reset personalization
        </Button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-canvas p-4">
          <p className="text-xs text-muted">Recently viewed</p>
          <p className="mt-1 text-lg font-semibold">{entries.length} products</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {entries.length
              ? "Because you viewed: " +
                entries
                  .slice(0, 3)
                  .map((entry) => entry.product.title)
                  .join(", ")
              : "No browsing history yet"}
          </p>
        </div>
        <div className="rounded-2xl bg-canvas p-4">
          <p className="text-xs text-muted">Typical observed price</p>
          <p className="mt-1 text-lg font-semibold">
            {!enabled.priceRange
              ? "Disabled in preferences"
              : range
                ? "₹" +
                  Math.round(range.min).toLocaleString("en-IN") +
                  " – ₹" +
                  Math.round(range.max).toLocaleString("en-IN")
                : "Not enough data"}
          </p>
          <p className="mt-1 text-xs text-muted">
            Illustrative INR conversion from viewed and carted products
          </p>
        </div>
        <div className="rounded-2xl bg-canvas p-4">
          <p className="text-xs text-muted">Recent searches</p>
          <p className="mt-1 text-lg font-semibold">{searches.length} searches</p>
          <p className="mt-1 line-clamp-2 text-xs text-muted">
            {searches.slice(0, 3).join(", ") || "No recent searches"}
          </p>
        </div>
        <div className="rounded-2xl bg-canvas p-4">
          <p className="text-xs text-muted">Active shopping context</p>
          <p className="mt-1 text-lg font-semibold">
            {wishlistCount} saved · {cartCount} cart · {orders.length} orders
          </p>
          <p className="mt-1 text-xs text-muted">
            Wishlist, cart and previous order items reflect current shopping intent.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-sm font-semibold">Recently viewed history</h3>
        <p className="mt-1 text-xs text-muted">Your full local history, newest first.</p>
        {entries.length ? (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.product.id}>
                <Link
                  href={"/products/" + entry.product.id}
                  className="flex items-center gap-3 rounded-xl border border-black/5 p-2 hover:bg-canvas"
                >
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-canvas">
                    <Image
                      src={entry.product.thumbnail}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block line-clamp-1 text-xs font-semibold">
                      {entry.product.title}
                    </span>
                    <span className="mt-1 block text-[10px] capitalize text-muted">
                      {entry.product.category}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl bg-canvas p-4 text-xs text-muted">
            No products viewed yet. Open a product to start your history.
          </p>
        )}
      </div>
      <h3 className="mt-7 text-sm font-semibold">Signals used by recommendations</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(Object.keys(labels) as RecommendationSignalKey[]).map((key) => (
          <label
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-black/5 px-4 py-3 text-sm"
          >
            <span>{labels[key]}</span>
            <input
              type="checkbox"
              checked={enabled[key]}
              onChange={(event) => setEnabled(key, event.target.checked)}
              aria-label={"Use " + labels[key]}
              className="size-4 accent-brand"
            />
          </label>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted">
        Turning off a signal only changes recommendations. Reset personalization clears
        recently viewed products and recent searches; it does not remove items from your
        cart, wishlist, or order history.
      </p>
    </section>
  );
}
