import { MockRecommendationProvider } from "../providers/mock-recommendation-provider";
import type { RecommendationRequest, RecommendedProduct } from "../types";
import type { RecommendationProvider } from "../providers/recommendation-provider";

const provider: RecommendationProvider = new MockRecommendationProvider();
export const recommendationService = {
  recommend(request: RecommendationRequest): RecommendedProduct[] {
    return provider.recommend(request);
  },
};
