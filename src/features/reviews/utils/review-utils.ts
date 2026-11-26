import type { ShopOrder } from "@/features/checkout/store/checkout-store";
import type { ProductReviewRecord, ReviewVote } from "../types";

export const MIN_REVIEW_LENGTH = 20;
export const MAX_REVIEW_LENGTH = 1000;
export const MAX_REVIEW_TITLE_LENGTH = 80;

export function getRatingDistribution(
  reviews: ProductReviewRecord[],
): Record<1 | 2 | 3 | 4 | 5, number> {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5)
      distribution[review.rating as 1 | 2 | 3 | 4 | 5] += 1;
  });
  return distribution;
}

export function getAverageRating(reviews: ProductReviewRecord[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
}

export function sortReviews(
  reviews: ProductReviewRecord[],
  sort: "recent" | "highest" | "lowest" | "helpful",
): ProductReviewRecord[] {
  return [...reviews].sort((a, b) => {
    if (sort === "highest")
      return b.rating - a.rating || Date.parse(b.createdAt) - Date.parse(a.createdAt);
    if (sort === "lowest")
      return a.rating - b.rating || Date.parse(b.createdAt) - Date.parse(a.createdAt);
    if (sort === "helpful")
      return (
        b.helpfulCount - a.helpfulCount ||
        Date.parse(b.createdAt) - Date.parse(a.createdAt)
      );
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function hasVerifiedPurchase(
  email: string,
  productId: number,
  orders: ShopOrder[],
): boolean {
  const normalizedEmail = email.trim().toLowerCase();
  return orders.some(
    (order) =>
      order.customer.email.trim().toLowerCase() === normalizedEmail &&
      order.items.some((item) => item.productId === productId),
  );
}

export function getReviewVoteCounts(votes: Record<string, ReviewVote>): {
  helpful: number;
  notHelpful: number;
} {
  return Object.values(votes).reduce(
    (counts, vote) => {
      if (vote === "HELPFUL") counts.helpful += 1;
      else counts.notHelpful += 1;
      return counts;
    },
    { helpful: 0, notHelpful: 0 },
  );
}
