import { MockRecommendationProvider } from "../providers/mock-recommendation-provider";
import type { RecommendationProvider, RecommendationRequest, RecommendedProduct } from "../types";

const provider: RecommendationProvider = new MockRecommendationProvider();
export const recommendationService = {
  recommend(request: RecommendationRequest): RecommendedProduct[] {
    return provider.recommend(request);
  },
};
