import type { Metadata } from "next";
import Link from "next/link";
import { OrderPanel } from "@/components/order-panel";
import { buttonClass } from "@/components/button";
import { getOrderIfAllowed } from "@/actions/shop";

export const metadata: Metadata = { title: "Order" };

export default async function OrderReceiptPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const order = await getOrderIfAllowed(number);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center">
        <h1 className="font-display text-4xl text-cocoa">Find this order</h1>
        <p className="mt-3 text-sm text-muted">
          Use the order number and the email from checkout. Guests can always look an order up that way.
        </p>
        <Link href={`/track?number=${encodeURIComponent(number)}`} className={`${buttonClass("solid")} mt-6`}>
          Track an order
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <p className="font-script text-3xl text-sage">it&apos;s in the book</p>
      <h1 className="font-display text-5xl text-cocoa">Order placed</h1>
      <p className="mt-2 mb-8 max-w-xl text-sm text-muted">
        Save {order.number}. You can follow every stitch from here, or look it up later with your email.
      </p>
      <OrderPanel order={order} />
    </div>
  );
}
