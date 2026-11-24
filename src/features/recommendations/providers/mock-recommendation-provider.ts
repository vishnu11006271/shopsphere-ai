import { getRecommendations } from "../engine/mock-recommendation-engine";
import type { RecommendationProvider } from "./recommendation-provider";
export class MockRecommendationProvider implements RecommendationProvider {
  recommend = getRecommendations;
}
