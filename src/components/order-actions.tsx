"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrder } from "@/actions/admin";
import { Button, controlClass } from "@/components/button";
import { nextStatus, STATUS_LABEL } from "@/lib/order-flow";
import type { OrderStatus } from "@/lib/types";

export function OrderActions({
  number,
  status,
  courier,
  trackingCode,
}: {
  number: string;
  status: OrderStatus;
  courier: string;
  trackingCode: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const upcoming = nextStatus(status);

  async function run(intent: "advance" | "cancel" | "note", form?: HTMLFormElement) {
    const data = form ? new FormData(form) : new FormData();
    setPending(true);
    const result = await updateOrder({
      number,
      intent,
      note: data.get("note") ?? "",
      courier: data.get("courier") ?? courier,
      trackingCode: data.get("trackingCode") ?? trackingCode,
    });
    setPending(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    if (form && intent === "note") form.reset();
    toast.success(intent === "note" ? "Note saved" : intent === "cancel" ? "Order cancelled" : "Status updated");
    router.refresh();
  }

  return (
    <form
      ref={formRef}
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void run("note", event.currentTarget);
      }}
    >
      {upcoming === "shipped" ? (
        <>
          <input name="courier" defaultValue={courier || "Studio courier"} placeholder="Courier" className={controlClass} />
          <input name="trackingCode" defaultValue={trackingCode} placeholder="Tracking code" className={controlClass} />
        </>
      ) : null}
      <textarea name="note" rows={3} placeholder="A note for the customer" className={`${controlClass} h-auto py-3`} />
      <div className="flex flex-wrap gap-2">
        {upcoming ? (
          <Button type="button" disabled={pending} onClick={() => void run("advance", formRef.current ?? undefined)}>
            Move to {STATUS_LABEL[upcoming].toLowerCase()}
          </Button>
        ) : null}
        <Button type="submit" variant="ghost" disabled={pending}>Save note</Button>
        {status !== "cancelled" && status !== "delivered" ? (
          <Button
            type="button"
            variant="danger"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("Cancel this order and return the pieces to the shelf?")) return;
              void run("cancel");
            }}
          >
            Cancel order
          </Button>
        ) : null}
      </div>
    </form>
  );
}
