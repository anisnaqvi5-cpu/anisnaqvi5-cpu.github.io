"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { shopApi } from "@/lib/shopApi";
import type { OrderItemRecord, OrderRecord, Review } from "@/lib/ecommerce/types";

export function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableItem, setReviewableItem] = useState<OrderItemRecord | null>(null);
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    shopApi.listReviews(productId).then((r) => setReviews(r.reviews)).catch(() => undefined);

    shopApi
      .listOrders()
      .then(async ({ orders }) => {
        const delivered = orders.filter((o: OrderRecord) => o.status === "delivered");
        for (const order of delivered) {
          const detail = await shopApi.getOrder(order.id);
          const item = detail.items.find((i) => i.productId === productId);
          if (item && !reviews.some((r) => r.orderItemId === item.id)) {
            setReviewableItem(item);
            break;
          }
        }
      })
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function submitReview() {
    if (!reviewableItem) return;
    setSubmitting(true);
    try {
      await shopApi.createReview({ productId, orderItemId: reviewableItem.id, rating, comment });
      setSubmitted(true);
      const updated = await shopApi.listReviews(productId);
      setReviews(updated.reviews);
    } catch (err) {
      // eslint-disable-next-line no-alert
      alert(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-lg text-foreground">Reviews</h2>

      {submitted && (
        <p className="rounded-card border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
          Thanks! Your review was submitted and is pending moderation before it appears here.
        </p>
      )}

      {reviewableItem && !submitted && (
        <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
          <p className="text-sm text-foreground">You bought this — leave a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n as 1 | 2 | 3 | 4 | 5)} aria-label={`${n} stars`}>
                <Star size={20} className={n <= rating ? "fill-accent text-accent" : "text-border"} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows={2}
            className="resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <button
            disabled={submitting}
            onClick={submitReview}
            className="self-start rounded-pill bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted">No reviews yet — be the first to share your experience.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-card border border-border bg-surface p-3">
              <div className="mb-1 flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={14} className={n <= r.rating ? "fill-accent text-accent" : "text-border"} />
                ))}
              </div>
              <p className="text-sm text-foreground">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
