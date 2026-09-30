"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveCoupon } from "@/actions/admin";
import { Button, Field, controlClass } from "@/components/button";
import type { Coupon } from "@/lib/types";

export function OfferForm({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-3">
        {coupons.map((coupon) => (
          <li key={coupon.code} className="rounded-3xl border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white px-4 py-4">
            <p className="font-display text-2xl">{coupon.code}</p>
            <p className="text-sm text-muted">
              {coupon.label} · {coupon.type} · {coupon.active ? "live" : "paused"} · from Rs{coupon.minOrder.toLocaleString("en-US")}
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-semibold text-sage"
              onClick={async () => {
                const result = await saveCoupon({ ...coupon, active: !coupon.active });
                if (!result.ok) toast.error(result.error);
                else router.refresh();
              }}
            >
              {coupon.active ? "Pause" : "Turn on"}
            </button>
          </li>
        ))}
      </ul>
      <form
        className="grid h-fit gap-3 rounded-[28px] border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const result = await saveCoupon({
            code: data.get("code"),
            label: data.get("label"),
            type: data.get("type"),
            value: Number(data.get("value")),
            minOrder: Number(data.get("minOrder")),
            active: true,
          });
          setPending(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Offer saved");
          event.currentTarget.reset();
          router.refresh();
        }}
      >
        <Field label="Code"><input name="code" required className={controlClass} /></Field>
        <Field label="Label"><input name="label" required className={controlClass} /></Field>
        <Field label="Type">
          <select name="type" className={controlClass} defaultValue="percent">
            <option value="percent">Percent</option>
            <option value="fixed">Fixed rupees</option>
            <option value="shipping">Free delivery</option>
          </select>
        </Field>
        <Field label="Value" hint="Percent, or rupees. Use 0 for free delivery.">
          <input name="value" type="number" min={0} required className={controlClass} defaultValue={10} />
        </Field>
        <Field label="Minimum order">
          <input name="minOrder" type="number" min={0} required className={controlClass} defaultValue={0} />
        </Field>
        <Button disabled={pending}>{pending ? "Saving…" : "Save offer"}</Button>
      </form>
    </div>
  );
}
