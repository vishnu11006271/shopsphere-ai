"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, MessageSquare, Star, ThumbsDown, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCheckoutStore } from "@/features/checkout/store/checkout-store";
import { useReviewStore } from "../store/review-store";
import type { Product } from "@/types/product";
import type { ProductReviewRecord } from "../types";
import { getAverageRating, getRatingDistribution, hasVerifiedPurchase, MAX_REVIEW_LENGTH, MAX_REVIEW_TITLE_LENGTH, MIN_REVIEW_LENGTH, sortReviews } from "../utils/review-utils";

function ReviewCard({ review, userId }: { review: ProductReviewRecord; userId?: string }) {
  const voteReview = useReviewStore((state) => state.voteReview);
  const ownReview = userId === review.userId;
  const vote = userId ? review.votes[userId] : undefined;
  return <article className="rounded-2xl border border-black/5 bg-white p-5 shadow-soft">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-sm font-semibold">{review.reviewerName}</p><div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted"><span>{new Date(review.createdAt).toLocaleDateString()}</span>{review.verifiedPurchase && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700"><CheckCircle2 size={12}/> Verified purchase</span>}</div></div>
      <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f2e7] px-3 py-1.5 text-xs font-bold"><Star size={13} className="fill-accent text-accent"/>{review.rating}/5</span>
    </div>
    <h3 className="mt-4 text-sm font-bold">{review.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{review.body}</p>
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
      <span className="mr-1 text-xs text-muted">Was this helpful?</span>
      <Button type="button" variant={vote === "HELPFUL" ? "secondary" : "ghost"} disabled={!userId || ownReview} onClick={() => { if (userId) voteReview(review.id, userId, "HELPFUL"); }}><ThumbsUp size={13}/> Helpful ({review.helpfulCount})</Button>
      <Button type="button" variant={vote === "NOT_HELPFUL" ? "secondary" : "ghost"} disabled={!userId || ownReview} onClick={() => { if (userId) voteReview(review.id, userId, "NOT_HELPFUL"); }}><ThumbsDown size={13}/> Not helpful ({review.notHelpfulCount})</Button>
      {ownReview && <span className="ml-auto text-[11px] text-muted">You can manage this review from your dashboard.</span>}
    </div>
  </article>;
}

export function ProductReviews({ product }: { product: Product }) {
  const session = useAuthStore((state) => state.session);
  const users = useAuthStore((state) => state.users);
  const user = useMemo(() => {
    if (!session || session.expiresAt <= Date.now()) return null;
    const record = users.find((item) => item.id === session.userId);
    return record ? { id: record.id, name: record.name, email: record.email, role: record.role } : null;
  }, [session, users]);
  const orders = useCheckoutStore((state) => state.orders);
  const allReviews = useReviewStore((state) => state.reviews);
  const addReview = useReviewStore((state) => state.addReview);
  const [sort, setSort] = useState<"recent" | "highest" | "lowest" | "helpful">("recent");
  const reviews = useMemo(() => sortReviews(allReviews.filter((review) => review.productId === product.id && review.status === "PUBLISHED"), sort), [allReviews, product.id, sort]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const distribution = getRatingDistribution(reviews);
  const average = getAverageRating(reviews);
  const canReview = user?.role === "CUSTOMER";
  const alreadyReviewed = Boolean(user && allReviews.some((review) => review.productId === product.id && review.userId === user.id));

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !canReview) return;
    const cleanTitle = title.trim();
    const cleanBody = body.trim();
    if (cleanTitle.length < 3 || cleanTitle.length > MAX_REVIEW_TITLE_LENGTH) {
      setError("Add a title between 3 and 80 characters.");
      return;
    }
    if (cleanBody.length < MIN_REVIEW_LENGTH || cleanBody.length > MAX_REVIEW_LENGTH) {
      setError(`Your review must be between ${MIN_REVIEW_LENGTH} and ${MAX_REVIEW_LENGTH} characters.`);
      return;
    }
    addReview({
      productId: product.id, userId: user.id, reviewerName: user.name, reviewerEmail: user.email,
      rating, title: cleanTitle, body: cleanBody,
      verifiedPurchase: hasVerifiedPurchase(user.email, product.id, orders),
    });
    setTitle(""); setBody(""); setRating(5); setError("");
  }

  return <section className="mt-14 border-t border-black/5 pt-10" id="reviews">
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-brand">Shopper feedback</p><h2 className="mt-2 text-2xl font-bold">Customer reviews</h2><p className="mt-1 text-sm text-muted">Reviews from the ShopSphere community.</p></div>
          <label className="flex items-center gap-2 text-xs text-muted">Sort by<select aria-label="Sort reviews" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm text-ink"><option value="recent">Most recent</option><option value="highest">Highest rated</option><option value="lowest">Lowest rated</option><option value="helpful">Most helpful</option></select></label>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-soft"><div><div className="flex items-center gap-2"><Star size={22} className="fill-accent text-accent"/><span className="text-3xl font-bold">{average ? average.toFixed(1) : "—"}</span><span className="text-sm text-muted">/ 5</span></div><p className="mt-1 text-xs text-muted">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</p></div><div className="min-w-[180px] flex-1 space-y-1.5">{([5,4,3,2,1] as const).map((stars) => <div key={stars} className="flex items-center gap-2 text-xs"><span className="w-3 text-muted">{stars}</span><Star size={11} className="fill-accent text-accent"/><div className="h-2 flex-1 overflow-hidden rounded-full bg-canvas"><div className="h-full rounded-full bg-brand" style={{ width: `${reviews.length ? distribution[stars] / reviews.length * 100 : 0}%` }}/></div><span className="w-5 text-right text-muted">{distribution[stars]}</span></div>)}</div></div>
        <div className="mt-5 space-y-3">{reviews.length ? reviews.map((review) => <ReviewCard key={review.id} review={review} userId={user?.id}/>) : <div className="rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center"><MessageSquare className="mx-auto text-muted"/><p className="mt-3 font-semibold">No reviews yet</p><p className="mt-1 text-sm text-muted">Be the first to share your experience with this product.</p></div>}</div>
      </div>
      <aside className="h-fit rounded-2xl bg-white p-5 shadow-soft">
        <h3 className="text-lg font-bold">Write a review</h3><p className="mt-1 text-xs leading-5 text-muted">Share useful, respectful feedback to help other shoppers.</p>
        {alreadyReviewed ? <div className="mt-5 rounded-xl bg-[#f4f7f2] p-4 text-sm text-muted">You have already reviewed this product. You can edit or remove your review from your customer dashboard.</div>
        : canReview ? <form onSubmit={submitReview} className="mt-5 space-y-4">
          <fieldset><legend className="text-sm font-semibold">Your rating</legend><div className="mt-2 flex gap-1">{([1,2,3,4,5] as const).map((value)=><button key={value} type="button" aria-label={`${value} star${value===1?"":"s"}`} aria-pressed={rating===value} onClick={()=>setRating(value)} className="rounded-lg p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"><Star size={25} className={value<=rating?"fill-accent text-accent":"text-black/20"}/></button>)}</div></fieldset>
          <label className="block text-sm font-semibold">Review title<input value={title} onChange={(event)=>setTitle(event.target.value)} maxLength={MAX_REVIEW_TITLE_LENGTH} required placeholder="Summarize your experience" className="mt-2 w-full rounded-xl border border-black/10 bg-canvas px-3 py-3 text-sm font-normal outline-none focus:border-brand"/></label>
          <label className="block text-sm font-semibold">Your review<textarea value={body} onChange={(event)=>setBody(event.target.value)} minLength={MIN_REVIEW_LENGTH} maxLength={MAX_REVIEW_LENGTH} required rows={5} placeholder="What should other shoppers know?" className="mt-2 w-full resize-y rounded-xl border border-black/10 bg-canvas px-3 py-3 text-sm font-normal outline-none focus:border-brand"/></label>
          <p className="text-[11px] text-muted">{body.trim().length}/{MAX_REVIEW_LENGTH} characters · minimum {MIN_REVIEW_LENGTH}</p>
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}<Button type="submit" className="w-full">Submit review</Button>
          <p className="text-[10px] leading-4 text-muted">Reviews are saved locally in this browser. Verified purchase is based on your local order history.</p>
        </form> : <div className="mt-5 rounded-xl bg-canvas p-4"><p className="text-sm text-muted">Sign in with a customer account to submit a review.</p><Link href={`/login?next=${encodeURIComponent(`/products/${product.id}#reviews`)}`} className="mt-3 inline-flex text-sm font-semibold text-brand hover:underline">Sign in to review</Link></div>}
      </aside>
    </div>
  </section>;
}
