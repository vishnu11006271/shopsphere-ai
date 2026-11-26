import type { ProductReviewRecord } from "../types";
import { useReviewStore } from "../store/review-store";

export const reviewService = {
  listByProduct: (productId: number): ProductReviewRecord[] =>
    useReviewStore
      .getState()
      .reviews.filter(
        (review) => review.productId === productId && review.status === "PUBLISHED",
      ),
  listAll: (): ProductReviewRecord[] => useReviewStore.getState().reviews,
};
