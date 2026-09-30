import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
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
      <div className="mb-8 flex items-start gap-4 rounded-[28px] border border-line bg-white px-5 py-5 sm:px-6">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-foam text-sage-deep">
          <Check className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <p className="font-script text-2xl text-sage">it&apos;s in the book</p>
          <h1 className="font-display text-4xl text-cocoa sm:text-5xl">Order placed</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Save <span className="font-medium text-ink">{order.number}</span>. Follow every stitch from here, or look it up later with your email.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href={`/track?number=${encodeURIComponent(order.number)}`} className="text-sage-deep underline">Track this order</Link>
            <Link href="/account" className="text-sage-deep underline">Your profile</Link>
            <Link href="/shop" className="text-sage-deep underline">Keep browsing</Link>
          </div>
        </div>
      </div>
      <OrderPanel order={order} />
    </div>
  );
}
