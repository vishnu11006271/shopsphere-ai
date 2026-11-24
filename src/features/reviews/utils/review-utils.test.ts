import { describe, expect, it } from "vitest";
import { getAverageRating, getRatingDistribution, hasVerifiedPurchase, sortReviews } from "./review-utils";
import type { ProductReviewRecord } from "../types";

const reviews: ProductReviewRecord[] = [
  { id:"a",productId:1,userId:"u1",reviewerName:"A",reviewerEmail:"a@test.dev",rating:5,title:"A",body:"A",createdAt:"2026-01-02T00:00:00.000Z",verifiedPurchase:true,helpfulCount:1,notHelpfulCount:0,votes:{},status:"PUBLISHED" },
  { id:"b",productId:1,userId:"u2",reviewerName:"B",reviewerEmail:"b@test.dev",rating:3,title:"B",body:"B",createdAt:"2026-01-03T00:00:00.000Z",verifiedPurchase:false,helpfulCount:8,notHelpfulCount:0,votes:{},status:"PUBLISHED" },
];

describe("review utilities", () => {
  it("calculates rating average and 1–5 distribution", () => {
    expect(getAverageRating(reviews)).toBe(4);
    expect(getRatingDistribution(reviews)).toEqual({ 1:0, 2:0, 3:1, 4:0, 5:1 });
  });
  it("sorts reviews by rating, recency, and helpful votes", () => {
    expect(sortReviews(reviews, "recent").map((review)=>review.id)).toEqual(["b","a"]);
    expect(sortReviews(reviews, "highest").map((review)=>review.id)).toEqual(["a","b"]);
    expect(sortReviews(reviews, "helpful").map((review)=>review.id)).toEqual(["b","a"]);
  });
  it("derives verified purchase from the matching local order and product", () => {
    const orders = [{ customer:{email:"buyer@example.com"},items:[{productId:1}] }] as never;
    expect(hasVerifiedPurchase("BUYER@example.com",1,orders)).toBe(true);
    expect(hasVerifiedPurchase("buyer@example.com",2,orders)).toBe(false);
  });
});
