"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/admin";
import { buttonClass } from "@/components/button";

export function DeleteProduct({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={buttonClass("danger", "mt-3")}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const result = await deleteProduct(id);
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Piece removed");
        router.push("/admin/products");
        router.refresh();
      }}
    >
      {pending ? "Removing…" : "Delete piece"}
    </button>
  );
}
