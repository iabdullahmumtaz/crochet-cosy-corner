"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrder } from "@/actions/admin";
import { guardSave } from "@/lib/guard-save";
import { Button, Field, controlClass } from "@/components/button";
import { STATUS_LABEL } from "@/lib/order-flow";
import type { OrderStatus } from "@/lib/types";

const statuses = Object.keys(STATUS_LABEL) as OrderStatus[];

export function OrderActions({
  number,
  status,
  courier,
  trackingCode,
  name,
  phone,
  address,
  city,
}: {
  number: string;
  status: OrderStatus;
  courier: string;
  trackingCode: string;
  name: string;
  phone: string;
  address: string;
  city: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function send(intent: "set" | "details", form: HTMLFormElement) {
    const data = new FormData(form);
    const result = await guardSave(setPending, () => updateOrder({
      number,
      intent,
      status: data.get("status"),
      note: data.get("note") ?? "",
      courier: data.get("courier") ?? "",
      trackingCode: data.get("trackingCode") ?? "",
      name: data.get("name"),
      phone: data.get("phone") ?? "",
      address: data.get("address"),
      city: data.get("city"),
    }));
    if (!result) return;
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(intent === "details" ? "Delivery details saved" : "Order updated");
    router.refresh();
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void send("set", event.currentTarget);
      }}
    >
      <Field label="Name">
        <input name="name" required defaultValue={name} className={controlClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" defaultValue={phone} className={controlClass} />
      </Field>
      <Field label="Address">
        <input name="address" required defaultValue={address} className={controlClass} />
      </Field>
      <Field label="City">
        <input name="city" required defaultValue={city} className={controlClass} />
      </Field>
      <Field label="Courier">
        <input name="courier" defaultValue={courier} placeholder="Studio courier" className={controlClass} />
      </Field>
      <Field label="Tracking code">
        <input name="trackingCode" defaultValue={trackingCode} className={controlClass} />
      </Field>
      <Field label="Status">
        <select name="status" defaultValue={status} className={controlClass}>
          {statuses.map((item) => (
            <option key={item} value={item}>{STATUS_LABEL[item]}</option>
          ))}
        </select>
      </Field>
      <Field label="Note for the customer">
        <textarea name="note" rows={3} placeholder="Optional. Shown on the tracking page." className={`${controlClass} h-auto py-3`} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending}>{pending ? "Saving…" : "Update order"}</Button>
        <Button type="button" variant="ghost" disabled={pending} onClick={(event) => void send("details", event.currentTarget.form!)}>
          Save details only
        </Button>
      </div>
    </form>
  );
}
