"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import reviewFixtures from "../../../../public/mock-data/reviews.json";
import type { ProductReviewRecord, ReviewStatus, ReviewVote } from "../types";
import { getReviewVoteCounts } from "../utils/review-utils";

const seedReviews = reviewFixtures as ProductReviewRecord[];

interface ReviewState {
  reviews: ProductReviewRecord[];
  addReview: (review: Omit<ProductReviewRecord, "id" | "createdAt" | "helpfulCount" | "notHelpfulCount" | "votes" | "status">) => ProductReviewRecord;
  updateReview: (id: string, userId: string, patch: Pick<ProductReviewRecord, "rating" | "title" | "body">) => void;
  deleteReview: (id: string, userId: string) => void;
  voteReview: (id: string, userId: string, vote: ReviewVote) => void;
  setReviewStatus: (id: string, status: ReviewStatus) => void;
}

export const useReviewStore = create<ReviewState>()(persist((set) => ({
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
      const previousCounts = getReviewVoteCounts(review.votes);
      const baselineHelpful = Math.max(0, review.helpfulCount - previousCounts.helpful);
      const baselineNotHelpful = Math.max(0, review.notHelpfulCount - previousCounts.notHelpful);
      const counts = getReviewVoteCounts(votes);
      return { ...review, votes, helpfulCount: baselineHelpful + counts.helpful, notHelpfulCount: baselineNotHelpful + counts.notHelpful };
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
