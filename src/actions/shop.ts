"use server";

import { headers } from "next/headers";
import { canViewOrder, getCurrentUser, requireRole, setReceipt } from "@/lib/auth";
import { applyCoupon } from "@/lib/coupons";
import { CITIES, PAYMENTS, shippingFor } from "@/lib/domain";
import { readStore, updateStore } from "@/lib/db";
import { eventCopy, makeEvent } from "@/lib/order-flow";
import { priceLines } from "@/lib/pricing";
import { rateLimit } from "@/lib/rate-limit";
import { addressSchema, messageSchema, orderSchema, profileSchema, quoteSchema, reviewSchema, subscribeSchema, trackSchema } from "@/lib/validators";
import type { ActionFail, ActionOk, Order, Quote } from "@/lib/types";

async function callerKey() {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function trap(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function quoteCart(input: unknown): Promise<Quote> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "The basket could not be read." };
  const store = await readStore();
  const priced = priceLines(store.products, parsed.data.items);
  if (!priced.ok) return priced;
  const city = parsed.data.city && (CITIES as readonly string[]).includes(parsed.data.city) ? parsed.data.city : null;
  const deal = applyCoupon(store.coupons ?? [], parsed.data.coupon, priced.subtotal);
  let shipping = city ? shippingFor(priced.subtotal, city) : null;
  let discount = 0;
  let couponCode = "";
  let couponLabel = "";
  let couponError = "";
  if (!deal.ok) couponError = deal.error;
  else {
    discount = deal.discount;
    couponCode = deal.code;
    couponLabel = deal.label;
    if (deal.freeShipping && shipping !== null) shipping = 0;
  }
  return {
    ok: true,
    lines: priced.lines,
    subtotal: priced.subtotal,
    shipping,
    discount,
    couponCode,
    couponLabel,
    couponError,
    total: Math.max(0, priced.subtotal - discount + (shipping ?? 0)),
  };
}

export async function placeOrder(input: unknown): Promise<ActionFail | { ok: true; number: string }> {
  if (trap((input as { company?: string } | null)?.company)) {
    return { ok: false, error: "The order could not be placed." };
  }
  const raw = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const parsed = orderSchema.safeParse({
    ...raw,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    reference: typeof raw.reference === "string" ? raw.reference : "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the delivery details." };

  const limited = rateLimit(`order:${await callerKey()}`, 10, 60 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  const user = await getCurrentUser();
  const email = user?.role === "customer" ? user.email : parsed.data.email.toLowerCase();
  const result = await updateStore((store) => {
    const priced = priceLines(store.products, parsed.data.items);
    if (!priced.ok) return priced;
    const deal = applyCoupon(store.coupons ?? [], parsed.data.coupon, priced.subtotal);
    if (!deal.ok) return deal;
    for (const line of priced.lines) {
      const product = store.products.find((item) => item.id === line.productId);
      if (!product || product.stock < line.qty) {
        return { ok: false as const, error: `${line.name} just sold out.` };
      }
      product.stock -= line.qty;
    }
    const shipping = deal.freeShipping ? 0 : shippingFor(priced.subtotal, parsed.data.city);
    const number = `CC-${store.seq}`;
    store.seq += 1;
    const copy = eventCopy("placed");
    const order: Order = {
      id: crypto.randomUUID(),
      number,
      userId: user?.role === "customer" ? user.id : null,
      email,
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      notes: parsed.data.notes,
      payment: parsed.data.payment,
      reference: parsed.data.reference,
      items: priced.lines.map((line) => ({
        productId: line.productId,
        name: line.name,
        price: line.price,
        qty: line.qty,
        lineTotal: line.lineTotal,
      })),
      subtotal: priced.subtotal,
      shipping,
      discount: deal.discount,
      couponCode: deal.code,
      total: Math.max(0, priced.subtotal - deal.discount + shipping),
      status: "placed",
      courier: "",
      trackingCode: "",
      stockRestored: false,
      events: [makeEvent("placed", copy.label, copy.note)],
      createdAt: new Date().toISOString(),
    };
    store.orders.unshift(order);
    return { ok: true as const, number };
  });

  if (!result.ok) return result;
  await setReceipt(result.number);
  return result;
}

export async function lookupOrder(input: unknown): Promise<ActionFail | { ok: true; order: Order }> {
  const parsed = trackSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the order details." };
  const limited = rateLimit(`track:${parsed.data.email}:${await callerKey()}`, 12, 15 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  const store = await readStore();
  const order = store.orders.find(
    (item) => item.number === parsed.data.number && item.email === parsed.data.email.toLowerCase(),
  );
  if (!order) return { ok: false, error: "We couldn't find an order with those details." };
  const allowed = await canViewOrder(order);
  if (!allowed && order.email !== parsed.data.email.toLowerCase()) {
    return { ok: false, error: "We couldn't find an order with those details." };
  }
  return { ok: true, order };
}

export async function sendMessage(input: unknown): Promise<ActionOk | ActionFail> {
  if (trap((input as { company?: string } | null)?.company)) {
    return { ok: false, error: "The message could not be sent." };
  }
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the message." };
  const limited = rateLimit(`message:${await callerKey()}`, 5, 60 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  await updateStore((store) => {
    store.messages.unshift({
      id: crypto.randomUUID(),
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
      topic: parsed.data.topic,
      body: parsed.data.body,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
  return { ok: true };
}

export async function subscribe(input: unknown): Promise<ActionOk | ActionFail | { ok: true; already: true }> {
  const parsed = subscribeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Enter a real email." };
  const email = parsed.data.email.toLowerCase();
  const limited = rateLimit(`list:${email}`, 6, 60 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  const already = await updateStore((store) => {
    if (store.subscribers.some((item) => item.email === email)) return true;
    store.subscribers.unshift({ id: crypto.randomUUID(), email, createdAt: new Date().toISOString() });
    return false;
  });
  if (already) return { ok: true, already: true };
  return { ok: true };
}

export async function updateProfile(input: unknown): Promise<ActionOk | ActionFail> {
  const user = await requireRole("customer");
  if (!user) return { ok: false, error: "Sign in to save your details." };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  if (parsed.data.city && !(CITIES as readonly string[]).includes(parsed.data.city)) {
    return { ok: false, error: "Choose a city from the list." };
  }
  await updateStore((store) => {
    const row = store.users.find((item) => item.id === user.id);
    if (!row) return;
    row.name = parsed.data.name;
    row.phone = parsed.data.phone;
    row.city = parsed.data.city;
  });
  return { ok: true };
}

export async function addReview(input: unknown): Promise<ActionOk | ActionFail> {
  const user = await requireRole("customer");
  if (!user) return { ok: false, error: "Sign in to leave a note." };
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the note." };
  return updateStore((store) => {
    const bought = store.orders.some(
      (order) =>
        order.userId === user.id &&
        order.status === "delivered" &&
        order.items.some((item) => item.productId === parsed.data.productId),
    );
    if (!bought) return { ok: false as const, error: "Notes open after this piece is delivered." };
    if (store.reviews.some((review) => review.userId === user.id && review.productId === parsed.data.productId)) {
      return { ok: false as const, error: "You already left a note on this piece." };
    }
    store.reviews.unshift({
      id: crypto.randomUUID(),
      productId: parsed.data.productId,
      userId: user.id,
      name: user.name,
      city: user.city || "Pakistan",
      rating: parsed.data.rating,
      text: parsed.data.text,
      createdAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
}

export async function saveAddress(input: unknown): Promise<ActionOk | ActionFail> {
  const user = await requireRole("customer");
  if (!user) return { ok: false, error: "Sign in to save an address." };
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the address." };
  return updateStore((store) => {
    const row = store.users.find((item) => item.id === user.id);
    if (!row) return { ok: false as const, error: "Account not found." };
    row.addresses ??= [];
    if (row.addresses.length >= 5) return { ok: false as const, error: "Five addresses is the limit." };
    row.addresses.push({ id: crypto.randomUUID(), ...parsed.data });
    row.city = parsed.data.city;
    row.phone = parsed.data.phone;
    return { ok: true as const };
  });
}

export async function removeAddress(id: string): Promise<ActionOk | ActionFail> {
  const user = await requireRole("customer");
  if (!user) return { ok: false, error: "Sign in to edit addresses." };
  if (!id || id.length > 80) return { ok: false, error: "That address could not be removed." };
  await updateStore((store) => {
    const row = store.users.find((item) => item.id === user.id);
    if (!row?.addresses) return;
    row.addresses = row.addresses.filter((item) => item.id !== id);
  });
  return { ok: true };
}

export async function getOrderIfAllowed(number: string) {
  if (!/^CC-\d+$/.test(number)) return null;
  const store = await readStore();
  const order = store.orders.find((item) => item.number === number);
  if (!order) return null;
  if (!(await canViewOrder(order))) return null;
  return order;
}
