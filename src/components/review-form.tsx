"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addReview } from "@/actions/shop";
import { Button, controlClass } from "@/components/button";

export function ReviewForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="panel mt-5 max-w-lg rounded-3xl p-6"
      onSubmit={async (event) => {
        event.preventDefault();
        const text = String(new FormData(event.currentTarget).get("text") ?? "");
        setPending(true);
        const result = await addReview({ productId, rating, text });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Note saved");
        router.refresh();
      }}
    >
      <p className="text-sm font-semibold">Leave a note</p>
      <div className="mt-3 flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={`h-10 w-10 rounded-full border text-sm ${rating === value ? "border-sage-deep bg-sage text-white" : "border-line bg-white"}`}
            onClick={() => setRating(value)}
          >
            {value}
          </button>
        ))}
      </div>
      <textarea name="text" required minLength={8} rows={3} placeholder="How does it feel in the hand?" className={`${controlClass} mt-3 h-auto py-3`} />
      <Button className="mt-3" disabled={pending}>{pending ? "Saving…" : "Share the note"}</Button>
    </form>
  );
}
