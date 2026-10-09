"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCoupon, saveCoupon } from "@/actions/admin";
import { guardSave } from "@/lib/guard-save";
import { Button, Field, controlClass } from "@/components/button";
import type { Coupon } from "@/lib/types";

export function OfferForm({ coupons }: { coupons: Coupon[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const current = coupons.find((item) => item.code === editing);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-3">
        {coupons.map((coupon) => (
          <li key={coupon.code} className="rounded-3xl border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white px-4 py-4">
            <p className="font-display text-2xl">{coupon.code}</p>
            <p className="text-sm text-muted">
              {coupon.label} · {coupon.type} · {coupon.active ? "live" : "paused"} · from Rs{coupon.minOrder.toLocaleString("en-US")}
            </p>
            <span className="mt-2 flex gap-3 text-sm">
              <button type="button" className="font-medium text-sage-deep" onClick={() => setEditing(coupon.code)}>Edit</button>
              <button
                type="button"
                className="font-medium text-sage"
                onClick={async () => {
                  const result = await guardSave(setPending, () => saveCoupon({ ...coupon, active: !coupon.active }));
                  if (!result) return;
                  if (!result.ok) toast.error(result.error);
                  else router.refresh();
                }}
              >
                {coupon.active ? "Pause" : "Turn on"}
              </button>
              <button
                type="button"
                className="font-medium text-sale"
                onClick={async () => {
                  if (!window.confirm(`Remove ${coupon.code}?`)) return;
                  const result = await guardSave(setPending, () => deleteCoupon(coupon.code));
                  if (!result) return;
                  if (!result.ok) toast.error(result.error);
                  else {
                    toast.success("Offer removed");
                    if (editing === coupon.code) setEditing(null);
                    router.refresh();
                  }
                }}
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ul>
      <form
        key={current?.code ?? "new"}
        className="grid h-fit gap-3 rounded-[28px] border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const result = await guardSave(setPending, () => saveCoupon({
            code: data.get("code"),
            label: data.get("label"),
            type: data.get("type"),
            value: Number(data.get("value")),
            minOrder: Number(data.get("minOrder")),
            active: current?.active ?? true,
          }));
          if (!result) return;
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(current ? "Offer updated" : "Offer saved");
          setEditing(null);
          event.currentTarget.reset();
          router.refresh();
        }}
      >
        <Field label="Code"><input name="code" required defaultValue={current?.code ?? ""} readOnly={Boolean(current)} className={controlClass} /></Field>
        <Field label="Label"><input name="label" required defaultValue={current?.label ?? ""} className={controlClass} /></Field>
        <Field label="Type">
          <select name="type" className={controlClass} defaultValue={current?.type ?? "percent"}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed rupees</option>
            <option value="shipping">Free delivery</option>
          </select>
        </Field>
        <Field label="Value" hint="Percent, or rupees. Use 0 for free delivery.">
          <input name="value" type="number" min={0} required className={controlClass} defaultValue={current?.value ?? 10} />
        </Field>
        <Field label="Minimum order">
          <input name="minOrder" type="number" min={0} required className={controlClass} defaultValue={current?.minOrder ?? 0} />
        </Field>
        <Button disabled={pending}>{pending ? "Saving…" : current ? "Update offer" : "Save offer"}</Button>
        {current ? (
          <button type="button" className="text-left text-sm text-muted underline" onClick={() => setEditing(null)}>
            New offer instead
          </button>
        ) : null}
      </form>
    </div>
  );
}
