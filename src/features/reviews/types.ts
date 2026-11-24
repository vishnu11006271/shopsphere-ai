export type ReviewVote = "HELPFUL" | "NOT_HELPFUL";
export type ReviewStatus = "PUBLISHED" | "HIDDEN";

export interface ProductReviewRecord {
  id: string;
  productId: number;
  userId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  votes: Record<string, ReviewVote>;
  status: ReviewStatus;
}
