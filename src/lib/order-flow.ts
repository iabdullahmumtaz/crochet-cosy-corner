import type { OrderStatus, TrackingEvent } from "@/lib/types";

export const STATUS_FLOW = [
  "placed",
  "confirmed",
  "making",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const satisfies readonly OrderStatus[];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  making: "On the hook",
  packed: "Packed with care",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function nextStatus(status: OrderStatus): OrderStatus | null {
  if (status === "cancelled" || status === "delivered") return null;
  const index = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number]);
  if (index < 0 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
}

export function eventCopy(
  status: OrderStatus,
  extra?: { courier?: string; trackingCode?: string },
): { label: string; note: string } {
  const courier = extra?.courier || "the studio courier";
  const code = extra?.trackingCode || "";
  switch (status) {
    case "placed":
      return { label: STATUS_LABEL.placed, note: "We have your order and saved a hook for it." };
    case "confirmed":
      return { label: STATUS_LABEL.confirmed, note: "Confirmed. The yarn for this piece is set aside." };
    case "making":
      return { label: STATUS_LABEL.making, note: "On the hook now. This one is being crocheted." };
    case "packed":
      return { label: STATUS_LABEL.packed, note: "Folded, wrapped, and ready to leave the studio." };
    case "shipped":
      return {
        label: STATUS_LABEL.shipped,
        note: code
          ? `Handed to ${courier}. Tracking ${code}.`
          : `Handed to ${courier}.`,
      };
    case "out_for_delivery":
      return { label: STATUS_LABEL.out_for_delivery, note: "Out for delivery today." };
    case "delivered":
      return { label: STATUS_LABEL.delivered, note: "Delivered. We hope it feels like a hug." };
    case "cancelled":
      return { label: STATUS_LABEL.cancelled, note: "Cancelled. The pieces go back on the shelf." };
  }
}

export function makeEvent(
  status: OrderStatus | "note",
  label: string,
  note: string,
  at = new Date().toISOString(),
): TrackingEvent {
  return { id: crypto.randomUUID(), status, label, note, at };
}
