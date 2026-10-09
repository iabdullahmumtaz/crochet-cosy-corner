"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteReview } from "@/actions/admin";
import { guardSave } from "@/lib/guard-save";

export function DeleteReview({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className="text-sale"
      disabled={pending}
      onClick={async () => {
        const result = await guardSave(setPending, () => deleteReview(id));
        if (!result) return;
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
