"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteReview } from "@/actions/admin";

export function DeleteReview({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="text-sale"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const result = await deleteReview(id);
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Review removed");
        router.refresh();
      }}
    >
      Remove
    </button>
  );
}
