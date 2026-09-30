import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl text-cocoa">Checkout</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm text-muted">
        We crochet after the order is confirmed. Cash on delivery, JazzCash, and EasyPaisa. Card numbers are never taken here.
      </p>
      <CheckoutForm user={user?.role === "customer" ? user : null} />
    </div>
  );
}
