import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = { title: "Basket" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl text-cocoa">Basket</h1>
      <p className="mt-2 mb-8 text-sm text-muted">Prices are confirmed again when you place the order.</p>
      <CartView />
    </div>
  );
}
