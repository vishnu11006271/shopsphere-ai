import type { Product } from "@/types/product";

export type RecommendationStrategy =
  | "recently-viewed"
  | "similar-products"
  | "category-based"
  | "price-based"
  | "wishlist-based"
  | "cart-based"
  | "frequently-bought-together"
  | "trending"
  | "personalized";

export type RecommendationSignalKey =
  | "recentlyViewed"
  | "searchHistory"
  | "categoryInterest"
  | "tagInterest"
  | "priceRange"
  | "ratingPreference"
  | "wishlist"
  | "cart"
  | "purchases"
  | "brandPreference";

export interface PriceRangeSignal { min: number; max: number; average: number; sampleSize: number; }
export interface RecommendationSignals {
  recentlyViewed: Product[];
  searchQueries: string[];
  wishlist: Product[];
  cart: Product[];
  purchases: Product[];
  currentCategory?: string;
  enabledSignals: Record<RecommendationSignalKey, boolean>;
}
export interface RecommendationReason { label: string; detail: string; }
export interface RecommendedProduct {
  product: Product;
  strategy: RecommendationStrategy;
  score: number;
  reasons: RecommendationReason[];
}
export interface RecommendationRequest {
  strategy: RecommendationStrategy;
  products: Product[];
  signals: RecommendationSignals;
  currentProduct?: Product;
  category?: string;
  limit?: number;
}
export interface RecommendationProvider {
  recommend(request: RecommendationRequest): RecommendedProduct[];
}
export interface RecommendationWeights {
  categoryMatch: number;
  priceSimilarity: number;
  tagOverlap: number;
  normalizedRating: number;
  recentlyViewedRelation: number;
  wishlistRelation: number;
  cartRelation: number;
}

export interface RecommendationContext {
  recentlyViewed: Product[];
  searchQueries: string[];
  wishlistIds: number[];
  wishlistSnapshots: Product[];
  cart: Product[];
  purchaseIds: number[];
  currentCategory?: string;
  enabledSignals: Record<RecommendationSignalKey, boolean>;
}
export interface RecommendationServiceRequest {
  strategy: RecommendationStrategy;
  products: Product[];
  context: RecommendationContext;
  currentProduct?: Product;
  category?: string;
  limit?: number;
}
