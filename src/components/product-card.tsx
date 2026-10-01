"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { CardPhoto } from "@/components/card-photo";
import { ProductArt } from "@/components/product-art";
import { useCart } from "@/components/cart-provider";
import { formatRs, percentOff } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product, eager = false, delay = 0 }: { product: Product; eager?: boolean; delay?: number }) {
  const { add, toggleKeep, keepsakes } = useCart();
  const saved = keepsakes.includes(product.id);
  const off = percentOff(product.price, product.compareAt);

  function onAdd() {
    if (product.stock < 1) {
      toast.error("This piece is sold out.");
      return;
    }
    const result = add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      qty: 1,
      motif: product.motif,
      palette: product.palette,
      imageUrl: product.imageUrl,
    });
    if (result === "max") toast.error("You can keep up to 5 of this piece.");
    else {
      toast.success(result === "updated" ? "Updated your basket" : "Added to your basket");
    }
  }

  return (
    <article className="card-rise group relative" style={{ animationDelay: `${delay}ms` }}>
      <button
        type="button"
        aria-pressed={saved}
        aria-label={saved ? "Remove from keepsakes" : "Save to keepsakes"}
        className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-white/90 text-bark backdrop-blur-sm transition hover:bg-white"
        onClick={() => {
          const nowSaved = toggleKeep(product.id);
          toast.success(nowSaved ? "Saved to keepsakes" : "Removed from keepsakes");
        }}
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-sale text-sale" : ""}`} />
      </button>
      <div className="panel lift relative overflow-hidden rounded-3xl">
        <Link href={`/product/${product.slug}`} className="block">
          <div className="motion-safe:transition motion-safe:duration-700 motion-safe:group-hover:scale-[1.04]">
            {product.imageUrl ? (
              <CardPhoto src={product.imageUrl} eager={eager} className="aspect-[4/5] w-full" />
            ) : (
              <ProductArt motif={product.motif} palette={product.palette} />
            )}
          </div>
        </Link>
        {product.stock > 0 ? (
          <button
            type="button"
            onClick={onAdd}
            className="pointer-events-none absolute inset-x-4 bottom-4 hidden h-11 items-center justify-center rounded-full bg-sage text-sm text-white opacity-0 shadow-[0_12px_28px_-16px_rgba(229,107,138,0.85)] transition group-hover:pointer-events-auto group-hover:opacity-100 md:flex"
          >
            Add to cart
          </button>
        ) : (
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs text-muted">Sold out</span>
        )}
      </div>
      <Link href={`/product/${product.slug}`} className="mt-4 block">
        <h3 className="font-display text-lg leading-tight break-words text-ink sm:text-xl">{product.name}</h3>
        <p className="mt-1.5 text-sm text-bark">
          <span>{formatRs(product.price)}</span>
          {product.compareAt && off ? (
            <>
              <span className="ml-2 text-muted line-through">{formatRs(product.compareAt)}</span>
              <span className="ml-2 text-sale">({off}% OFF)</span>
            </>
          ) : null}
        </p>
      </Link>
      {product.stock > 0 ? (
        <button type="button" onClick={onAdd} className="mt-3 h-10 w-full rounded-full bg-sage text-sm text-white md:hidden">
          Add to cart
        </button>
      ) : null}
    </article>
  );
}
