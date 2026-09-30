import Link from "next/link";
import { YarnTracker, StatusPill } from "@/components/yarn-tracker";
import { formatRs, formatWhenTime } from "@/lib/format";
import { PAYMENTS } from "@/lib/domain";
import type { Order } from "@/lib/types";

export function OrderPanel({ order, children }: { order: Order; children?: React.ReactNode }) {
  const payment = PAYMENTS.find((item) => item.id === order.payment)?.label ?? order.payment;
  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
      <section className="rounded-[28px] border border-line bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Placed {formatWhenTime(order.createdAt)}</p>
            <h2 className="font-display text-4xl text-cocoa">{order.number}</h2>
          </div>
          <StatusPill status={order.status} />
        </div>
        <div className="mt-8">
          <YarnTracker status={order.status} events={order.events} />
        </div>
      </section>
      <aside className="space-y-4">
        <div className="rounded-[28px] border border-line bg-white p-5">
          <h3 className="font-display text-2xl text-cocoa">Pieces</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.name}`} className="flex justify-between gap-3">
                <span>{item.name} × {item.qty}</span>
                <span>{formatRs(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatRs(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Delivery</span><span>{order.shipping === 0 ? "Free" : formatRs(order.shipping)}</span></div>
            {order.discount > 0 ? <div className="flex justify-between"><span className="text-muted">Offer {order.couponCode}</span><span>-{formatRs(order.discount)}</span></div> : null}
            <div className="flex justify-between font-medium"><span>Total</span><span>{formatRs(order.total)}</span></div>
          </div>
        </div>
        <div className="rounded-[28px] border border-line bg-white p-5 text-sm">
          <h3 className="font-display text-2xl text-cocoa">Delivery</h3>
          <p className="mt-3">{order.name}</p>
          <p className="text-muted">{order.address}</p>
          <p className="text-muted">{order.city}</p>
          <p className="mt-2">{order.phone}</p>
          <p className="text-muted">{order.email}</p>
          <p className="mt-3">{payment}</p>
          {order.reference ? <p className="text-muted">Reference {order.reference}</p> : null}
          {order.trackingCode ? <p className="mt-1">Tracking {order.trackingCode}</p> : null}
          {order.notes ? <p className="mt-3 text-muted">Note: {order.notes}</p> : null}
        </div>
        {children}
        <Link href="/track" className="inline-block text-sm text-sage-deep underline">Look this up later</Link>
      </aside>
    </div>
  );
}
