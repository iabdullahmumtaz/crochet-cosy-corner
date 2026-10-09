"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/admin";
import { guardSave } from "@/lib/guard-save";
import { buttonClass } from "@/components/button";

export function DeleteProduct({ id, compact = false }: { id: string; compact?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={compact ? "text-sm text-sale" : buttonClass("danger", "mt-3")}
      disabled={pending}
      onClick={async () => {
        if (!window.confirm("Remove this piece from the shop?")) return;
        const result = await guardSave(setPending, () => deleteProduct(id));
        if (!result) return;
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Piece removed");
        if (!compact) router.push("/admin/products");
        router.refresh();
      }}
    >
      {pending ? "Removing…" : compact ? "Delete" : "Delete piece"}
    </button>
  );
}
