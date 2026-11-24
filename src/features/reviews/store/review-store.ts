"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProductReviewRecord, ReviewStatus, ReviewVote } from "../types";
import { getReviewVoteCounts } from "../utils/review-utils";

const seedReviews: ProductReviewRecord[] = [
  {
    id: "REV-1", productId: 1, userId: "demo-customer", reviewerName: "Demo Customer",
    reviewerEmail: "customer@shopsphere.demo", rating: 5, title: "Great everyday pick",
    body: "Good quality for the price. The product matched the description and arrived in good condition.",
    createdAt: "2026-01-15T10:00:00.000Z", verifiedPurchase: false,
    helpfulCount: 12, notHelpfulCount: 0, votes: {}, status: "PUBLISHED",
  },
];

interface ReviewState {
  reviews: ProductReviewRecord[];
  addReview: (review: Omit<ProductReviewRecord, "id" | "createdAt" | "helpfulCount" | "notHelpfulCount" | "votes" | "status">) => ProductReviewRecord;
  updateReview: (id: string, userId: string, patch: Pick<ProductReviewRecord, "rating" | "title" | "body">) => void;
  deleteReview: (id: string, userId: string) => void;
  voteReview: (id: string, userId: string, vote: ReviewVote) => void;
  setReviewStatus: (id: string, status: ReviewStatus) => void;
}

export const useReviewStore = create<ReviewState>()(persist((set, get) => ({
  reviews: seedReviews,
  addReview: (payload) => {
    const review: ProductReviewRecord = {
      ...payload, id: `REV-${crypto.randomUUID()}`, createdAt: new Date().toISOString(),
      helpfulCount: 0, notHelpfulCount: 0, votes: {}, status: "PUBLISHED",
    };
    set((state) => ({ reviews: [review, ...state.reviews] }));
    return review;
  },
  updateReview: (id, userId, patch) => set((state) => ({
    reviews: state.reviews.map((review) => review.id === id && review.userId === userId ? { ...review, ...patch } : review),
  })),
  deleteReview: (id, userId) => set((state) => ({
    reviews: state.reviews.filter((review) => !(review.id === id && review.userId === userId)),
  })),
  voteReview: (id, userId, vote) => set((state) => ({
    reviews: state.reviews.map((review) => {
      if (review.id !== id || review.userId === userId || review.status !== "PUBLISHED") return review;
      const votes = { ...review.votes };
      if (votes[userId] === vote) delete votes[userId];
      else votes[userId] = vote;
      const counts = getReviewVoteCounts(votes);
      return { ...review, votes, helpfulCount: counts.helpful, notHelpfulCount: counts.notHelpful };
    }),
  })),
  setReviewStatus: (id, status) => set((state) => ({
    reviews: state.reviews.map((review) => review.id === id ? { ...review, status } : review),
  })),
}), {
  name: "shopsphere-product-reviews",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ reviews: state.reviews }),
}));
