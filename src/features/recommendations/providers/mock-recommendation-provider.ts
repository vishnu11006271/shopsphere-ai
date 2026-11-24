import { getRecommendations } from "../engine/mock-recommendation-engine";
import type { RecommendationProvider } from "../types";
export class MockRecommendationProvider implements RecommendationProvider {
  recommend = getRecommendations;
}
