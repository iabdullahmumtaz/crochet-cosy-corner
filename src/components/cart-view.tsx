"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { quoteCart } from "@/actions/shop";
import { BasketPhoto, useCart } from "@/components/cart-provider";
import { buttonClass } from "@/components/button";
import { FREE_DELIVERY } from "@/lib/domain";
import { formatRs } from "@/lib/format";
import type { Quote } from "@/lib/types";

export function CartView() {
  const { items, setQty, remove, ready } = useCart();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    if (!ready) return;
    let live = true;
    quoteCart({ items: items.map((item) => ({ productId: item.productId, qty: item.qty })) }).then((result) => {
      if (live) setQuote(result);
    });
    return () => {
      live = false;
    };
  }, [items, ready]);

  if (!ready) return <p className="text-sm text-muted">Opening your basket…</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-line bg-white px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-cocoa">Your basket is empty</h2>
        <p className="mt-2 text-sm text-muted">Scarves, bunnies, and bouquets are waiting in the shop.</p>
        <Link href="/shop" className={`${buttonClass("solid")} mt-6`}>
          Shop pieces
        </Link>
      </div>
    );
  }

  const lines = quote?.ok ? quote.lines : null;
  const subtotal = quote?.ok ? quote.subtotal : items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const remaining = Math.max(0, FREE_DELIVERY - subtotal);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <ul className="space-y-4">
        {items.map((item) => {
          const priced = lines?.find((line) => line.productId === item.productId);
          return (
            <li key={item.productId} className="flex gap-4 rounded-3xl border border-line bg-white p-3">
              <Link href={`/product/${item.slug}`} className="w-24 shrink-0 overflow-hidden rounded-2xl bg-sand">
                <BasketPhoto item={item} />
              </Link>
              <div className="min-w-0 flex-1 py-1">
                <Link href={`/product/${item.slug}`} className="text-ink">{item.name}</Link>
                <p className="mt-1 text-sm text-muted">{formatRs(priced?.price ?? item.price)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label="Decrease quantity" onClick={() => setQty(item.productId, item.qty - 1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-4 text-center text-sm">{item.qty}</span>
                  <button
                    className="grid h-8 w-8 place-items-center rounded-full border border-line"
                    aria-label="Increase quantity"
                    onClick={() => {
                      if (item.qty >= 5) {
                        toast.error("You can keep up to 5 of this piece.");
                        return;
                      }
                      setQty(item.productId, item.qty + 1);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                  <button className="ml-auto text-sm text-muted underline" onClick={() => { remove(item.productId); toast.success("Removed from your basket"); }}>
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="h-fit rounded-[28px] border border-line bg-white p-5">
        <h2 className="font-display text-2xl text-cocoa">Summary</h2>
        {quote && !quote.ok ? <p className="mt-3 text-sm text-sale">{quote.error}</p> : null}
        <div className="mt-4 flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span>{formatRs(subtotal)}</span>
        </div>
        <p className="mt-3 text-sm text-muted">
          {remaining === 0 ? "Delivery is on us." : `Add ${formatRs(remaining)} more for free delivery.`}
        </p>
        <Link href="/checkout" className={`${buttonClass("solid")} mt-5 w-full`}>
          Checkout
        </Link>
      </aside>
    </div>
  );
}
