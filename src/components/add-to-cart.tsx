"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/button";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { add, items, setOpen } = useCart();
  const [qty, setQty] = useState(1);
  const inBasket = items.find((item) => item.productId === product.id)?.qty ?? 0;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-line bg-white">
        <button type="button" className="grid h-12 w-12 place-items-center" aria-label="Decrease quantity" onClick={() => setQty((value) => Math.max(1, value - 1))}>
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-sm">{qty}</span>
        <button
          type="button"
          className="grid h-12 w-12 place-items-center"
          aria-label="Increase quantity"
          onClick={() => setQty((value) => Math.min(5, value + 1))}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <Button
        disabled={product.stock < 1}
        onClick={() => {
          if (inBasket + qty > product.stock) {
            toast.error(product.stock === 0 ? "This piece is sold out." : `Only ${product.stock} left.`);
            return;
          }
          const result = add({
            productId: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            qty,
            motif: product.motif,
            palette: product.palette,
            imageUrl: product.imageUrl,
          });
          if (result === "max") toast.error("You can keep up to 5 of this piece.");
          else {
            toast.success(result === "updated" ? "Updated your basket" : "Added to your basket", {
              description: product.name,
              action: { label: "View", onClick: () => setOpen(true) },
            });
          }
        }}
      >
        {product.stock < 1 ? "Sold out" : "Add to cart"}
      </Button>
    </div>
  );
}
