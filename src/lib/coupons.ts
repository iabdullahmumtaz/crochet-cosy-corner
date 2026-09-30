import type { Coupon } from "@/lib/types";

export function defaultCoupons(): Coupon[] {
  return [
    { code: "HUG10", label: "10% off", type: "percent", value: 10, minOrder: 1500, active: true },
    { code: "SOFT500", label: "Rs500 off", type: "fixed", value: 500, minOrder: 2500, active: true },
    { code: "FREESHIP", label: "Free delivery", type: "shipping", value: 0, minOrder: 0, active: true },
  ];
}

export function applyCoupon(coupons: Coupon[], code: string, subtotal: number) {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { ok: true as const, discount: 0, freeShipping: false, code: "", label: "" };
  }
  const coupon = coupons.find((item) => item.code === normalized && item.active);
  if (!coupon) return { ok: false as const, error: "That code isn't active." };
  if (subtotal < coupon.minOrder) {
    return { ok: false as const, error: `This code starts at Rs${coupon.minOrder.toLocaleString("en-US")}.` };
  }
  if (coupon.type === "shipping") {
    return { ok: true as const, discount: 0, freeShipping: true, code: coupon.code, label: coupon.label };
  }
  const discount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);
  return { ok: true as const, discount, freeShipping: false, code: coupon.code, label: coupon.label };
}
