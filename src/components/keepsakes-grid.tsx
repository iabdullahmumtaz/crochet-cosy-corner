"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { useCart } from "@/components/cart-provider";
import { buttonClass } from "@/components/button";
import { CardGridSkeleton } from "@/components/skeleton";
import type { Product } from "@/lib/types";

export function KeepsakesGrid({ products }: { products: Product[] }) {
  const { keepsakes, ready } = useCart();
  const saved = products.filter((product) => keepsakes.includes(product.id));

  if (!ready) return <CardGridSkeleton />;

  if (saved.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-line bg-white px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-cocoa">No keepsakes yet</h2>
        <p className="mt-2 text-sm text-muted">Tap the heart on a piece to save it here.</p>
        <Link href="/shop" className={`${buttonClass("solid")} mt-6`}>Browse the shop</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {saved.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
