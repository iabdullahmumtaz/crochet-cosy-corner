"use client";

import { useState } from "react";
import { toast } from "sonner";
import { lookupOrder } from "@/actions/shop";
import { Button, Field, controlClass } from "@/components/button";
import { YarnTracker, StatusPill } from "@/components/yarn-tracker";
import { formatRs, formatWhen } from "@/lib/format";
import { PAYMENTS } from "@/lib/domain";
import type { Order } from "@/lib/types";

export function TrackForm({ initialNumber = "" }: { initialNumber?: string }) {
  const [pending, setPending] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const payment = order ? PAYMENTS.find((item) => item.id === order.payment)?.label : "";

  return (
    <div className="grid gap-8">
      <form
        className="grid gap-4 rounded-[28px] border border-line bg-white p-5 sm:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const result = await lookupOrder({ number: data.get("number"), email: data.get("email") });
          setPending(false);
          if (!result.ok) {
            setOrder(null);
            toast.error(result.error);
            return;
          }
          setOrder(result.order);
          toast.success("Order found");
        }}
      >
        <Field label="Order number">
          <input name="number" required defaultValue={initialNumber} placeholder="CC-1904" className={controlClass} />
        </Field>
        <Field label="Email from checkout">
          <input name="email" type="email" required className={controlClass} />
        </Field>
        <div className="sm:col-span-2">
          <Button disabled={pending}>{pending ? "Looking…" : "Track order"}</Button>
        </div>
      </form>
      {order ? (
        <section className="rounded-[28px] border border-line bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Order {order.number}</p>
              <h2 className="font-display text-3xl text-cocoa">{order.name}</h2>
              <p className="text-sm text-muted">Placed {formatWhen(order.createdAt)} · {order.city}</p>
            </div>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-8">
            <YarnTracker status={order.status} events={order.events} />
          </div>
          <ul className="mt-8 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span>{item.name} × {item.qty}</span>
                <span>{formatRs(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-line pt-3 text-sm">
            <span>{payment}{order.trackingCode ? ` · ${order.trackingCode}` : ""}</span>
            <span>{formatRs(order.total)}</span>
          </div>
        </section>
      ) : null}
    </div>
  );
}
