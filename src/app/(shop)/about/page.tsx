import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/button";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/order-flow";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <p className="font-display text-lg font-semibold text-sage">the studio</p>
      <h1 className="font-display text-5xl text-ink">A hook, a skein, a small table.</h1>
      <div className="mt-6 space-y-4 text-base leading-7 text-muted">
        <p>
          Crochet Cosy Corner makes amigurumi, wearables, botanicals, and bags in small batches. Most pieces start after the order, so the yarn can follow the note you leave.
        </p>
        <p>
          Prices are in rupees. Delivery is free over Rs3,000, Rs180 inside Karachi, and Rs280 to the other cities we ship to. You can pay on delivery, or by JazzCash and EasyPaisa after we confirm the piece. We never ask for a card number on this site.
        </p>
      </div>
      <h2 className="mt-12 font-display text-3xl text-bark">From the hook to your door</h2>
      <ol className="mt-5 space-y-3">
        {STATUS_FLOW.map((step) => (
          <li key={step} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
            <span className="text-ink">{STATUS_LABEL[step]}</span>
          </li>
        ))}
      </ol>
      <Link href="/shop" className={`${buttonClass("solid")} mt-8`}>Shop the pieces</Link>
    </div>
  );
}
