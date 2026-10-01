"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/types";

export function ProductRail({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  function move(direction: number) {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: direction * Math.max(node.clientWidth * 0.72, 240), behavior: "smooth" });
  }

  return (
    <div className="group/rail relative">
      <button
        type="button"
        aria-label="Scroll pieces back"
        onClick={() => move(-1)}
        className="absolute top-[38%] left-0 z-10 hidden h-10 w-10 -translate-x-1/2 place-items-center rounded-full border border-line bg-white text-ink opacity-0 shadow-[0_12px_28px_-16px_rgba(196,77,114,0.8)] transition group-hover/rail:opacity-100 hover:bg-foam sm:grid"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div ref={scroller} className="rail flex snap-x gap-5 overflow-x-auto pb-4">
        {products.map((product) => (
          <div key={product.id} className="w-[72%] shrink-0 snap-start sm:w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-label="Scroll pieces forward"
        onClick={() => move(1)}
        className="absolute top-[38%] right-0 z-10 hidden h-10 w-10 translate-x-1/2 place-items-center rounded-full border border-line bg-white text-ink opacity-0 shadow-[0_12px_28px_-16px_rgba(196,77,114,0.8)] transition group-hover/rail:opacity-100 hover:bg-foam sm:grid"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
