"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useReviewStore } from "../store/review-store";
import { MAX_REVIEW_LENGTH, MAX_REVIEW_TITLE_LENGTH, MIN_REVIEW_LENGTH } from "../utils/review-utils";
import { Button } from "@/components/ui/button";

export function MyReviews() {
  const session = useAuthStore((state) => state.session);
  const users = useAuthStore((state) => state.users);
  const user = useMemo(() => session && session.expiresAt > Date.now() ? users.find((item) => item.id === session.userId) : undefined, [session, users]);
  const reviews = useReviewStore((state) => state.reviews);
  const updateReview = useReviewStore((state) => state.updateReview);
  const deleteReview = useReviewStore((state) => state.deleteReview);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const mine = reviews.filter((review) => review.userId === user?.id);

  function beginEdit(review: typeof reviews[number]) {
    setEditingId(review.id); setTitle(review.title); setBody(review.body); setRating(review.rating);
  }

  return <section className="mt-8 rounded-3xl bg-white p-6 shadow-soft">
    <h2 className="text-xl font-semibold">Your reviews</h2><p className="mt-1 text-sm text-muted">Reviews you have submitted can be edited or removed here.</p>
    {mine.length ? <div className="mt-5 space-y-4">{mine.map((review) => <article key={review.id} className="rounded-2xl border border-black/5 p-4">
      {editingId === review.id ? <form onSubmit={(event)=>{event.preventDefault();if(!user||body.trim().length<MIN_REVIEW_LENGTH||body.trim().length>MAX_REVIEW_LENGTH)return;updateReview(review.id,user.id,{title:title.trim(),body:body.trim(),rating});setEditingId(null);}} className="space-y-3">
        <label className="block text-xs font-semibold">Title<input value={title} onChange={(event)=>setTitle(event.target.value)} maxLength={MAX_REVIEW_TITLE_LENGTH} className="mt-1 w-full rounded-lg border border-black/10 p-2 text-sm"/></label>
        <label className="block text-xs font-semibold">Rating<select value={rating} onChange={(event)=>setRating(Number(event.target.value))} className="mt-1 rounded-lg border border-black/10 p-2 text-sm">{[5,4,3,2,1].map((value)=><option key={value} value={value}>{value} stars</option>)}</select></label>
        <label className="block text-xs font-semibold">Review<textarea value={body} onChange={(event)=>setBody(event.target.value)} minLength={MIN_REVIEW_LENGTH} maxLength={MAX_REVIEW_LENGTH} rows={4} className="mt-1 w-full rounded-lg border border-black/10 p-2 text-sm"/></label>
        <div className="flex gap-2"><Button type="submit" disabled={body.trim().length<MIN_REVIEW_LENGTH}>Save changes</Button><Button type="button" variant="secondary" onClick={()=>setEditingId(null)}>Cancel</Button></div>
      </form> : <><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{review.title}</p><p className="mt-1 text-xs text-muted">Product #{review.productId} · {review.rating}/5 · {review.status==="HIDDEN"?"Hidden by admin":"Published"}</p></div><div className="flex gap-2"><Button type="button" variant="secondary" onClick={()=>beginEdit(review)}>Edit</Button><Button type="button" variant="ghost" onClick={()=>deleteReview(review.id,user!.id)}>Remove</Button></div></div><p className="mt-3 text-sm leading-6 text-muted">{review.body}</p></>}
    </article>)}</div> : <p className="mt-5 rounded-xl bg-canvas p-5 text-sm text-muted">You have not submitted any reviews yet. Visit a product page to share your experience.</p>}
  </section>;
}
