"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecommendationStrategy } from "../types";

interface RecommendationAnalyticsState {
  impressions: Record<string, number>;
  clicks: Record<string, number>;
  addToCartFromRecommendation: Record<string, number>;
  recordImpression: (strategy: RecommendationStrategy, productIds: number[]) => void;
  recordClick: (strategy: RecommendationStrategy, productId: number) => void;
  recordAddToCart: (strategy: RecommendationStrategy, productId: number) => void;
}
const key = (strategy: RecommendationStrategy, productId: number) => strategy + ":" + productId;
export const useRecommendationAnalyticsStore = create<RecommendationAnalyticsState>()(persist((set) => ({
  impressions: {}, clicks: {}, addToCartFromRecommendation: {},
  recordImpression: (strategy, ids) => set((state) => {
    const impressions = { ...state.impressions };
    ids.forEach((id) => { const k = key(strategy, id); impressions[k] = (impressions[k] ?? 0) + 1; });
    return { impressions };
  }),
  recordClick: (strategy, id) => set((state) => { const k = key(strategy,id); return { clicks: { ...state.clicks, [k]: (state.clicks[k] ?? 0) + 1 } }; }),
  recordAddToCart: (strategy, id) => set((state) => { const k = key(strategy,id); return { addToCartFromRecommendation: { ...state.addToCartFromRecommendation, [k]: (state.addToCartFromRecommendation[k] ?? 0) + 1 } }; }),
}), {
  name: "shopsphere-recommendation-analytics",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ impressions: state.impressions, clicks: state.clicks, addToCartFromRecommendation: state.addToCartFromRecommendation }),
}));
