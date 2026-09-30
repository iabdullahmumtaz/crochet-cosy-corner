"use client";

import { useCart } from "@/components/cart-provider";

export function KeepCount() {
  const { keepsakes, ready } = useCart();
  return <span>{ready ? keepsakes.length : "—"}</span>;
}
