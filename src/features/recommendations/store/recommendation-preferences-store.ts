"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecommendationSignalKey } from "../types";

const defaultSignals: Record<RecommendationSignalKey, boolean> = {
  recentlyViewed: true, searchHistory: true, categoryInterest: true, tagInterest: true,
  priceRange: true, ratingPreference: true, wishlist: true, cart: true, purchases: true, brandPreference: true,
};
interface RecommendationPreferencesState {
  enabledSignals: Record<RecommendationSignalKey, boolean>;
  setSignalEnabled: (signal: RecommendationSignalKey, enabled: boolean) => void;
  reset: () => void;
}
export const useRecommendationPreferencesStore = create<RecommendationPreferencesState>()(persist((set) => ({
  enabledSignals: defaultSignals,
  setSignalEnabled: (signal, enabled) => set((state) => ({ enabledSignals: { ...state.enabledSignals, [signal]: enabled } })),
  reset: () => set({ enabledSignals: defaultSignals }),
}), {
  name: "shopsphere-recommendation-preferences",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ enabledSignals: state.enabledSignals }),
}));
