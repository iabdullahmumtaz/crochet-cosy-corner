"use server";

import { requireRole } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { eventCopy, makeEvent, nextStatus } from "@/lib/order-flow";
import { slugify } from "@/lib/format";
import { uploadShopImage } from "@/lib/storage";
import { categorySchema, couponSchema, orderUpdateSchema, productSchema, whatsappSchema } from "@/lib/validators";
import type { ActionFail, ActionOk, Product, ShopCategory } from "@/lib/types";

export async function uploadDeskImage(formData: FormData) {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false as const, error: "Sign in to the studio desk." };
  const file = formData.get("file");
  const folder = formData.get("folder") === "categories" ? "categories" : "products";
  if (!(file instanceof File)) return { ok: false as const, error: "Choose an image." };
  return uploadShopImage(file, folder);
}

export async function saveProduct(input: unknown): Promise<ActionFail | { ok: true; id: string }> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the piece details." };

  const compareAt =
    parsed.data.compareAt && parsed.data.compareAt > parsed.data.price ? parsed.data.compareAt : null;

  return updateStore((store) => {
    store.categories ??= [];
    if (!store.categories.some((category) => category.id === parsed.data.category)) {
      return { ok: false as const, error: "Choose a collection that exists." };
    }
    if (parsed.data.id) {
      const product = store.products.find((item) => item.id === parsed.data.id);
      if (!product) return { ok: false as const, error: "That piece is not in the studio." };
      product.name = parsed.data.name;
      product.description = parsed.data.description;
      product.price = parsed.data.price;
      product.compareAt = compareAt;
      product.category = parsed.data.category;
      product.motif = parsed.data.motif;
      product.palette = parsed.data.palette;
      product.stock = parsed.data.stock;
      product.yarn = parsed.data.yarn;
      product.imageUrl = parsed.data.imageUrl || product.imageUrl;
      product.featured = parsed.data.featured;
      product.active = parsed.data.active;
      return { ok: true as const, id: product.id };
    }

    let slug = slugify(parsed.data.name) || "piece";
    if (store.products.some((item) => item.slug === slug)) slug = `${slug}-${store.seq}`;
    const product: Product = {
      id: crypto.randomUUID(),
      slug,
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price,
      compareAt,
      category: parsed.data.category,
      motif: parsed.data.motif,
      palette: parsed.data.palette,
      stock: parsed.data.stock,
      yarn: parsed.data.yarn,
      imageUrl: parsed.data.imageUrl,
      featured: parsed.data.featured,
      active: parsed.data.active,
      createdAt: new Date().toISOString(),
    };
    store.products.unshift(product);
    return { ok: true as const, id: product.id };
  });
}

export async function updateOrder(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "That update could not be read." };

  return updateStore((store) => {
    const order = store.orders.find((item) => item.number === parsed.data.number);
    if (!order) return { ok: false as const, error: "That order is not in the book." };

    if (parsed.data.intent === "note") {
      if (!parsed.data.note) return { ok: false as const, error: "Write a note first." };
      order.events.push(makeEvent("note", "Studio note", parsed.data.note));
      return { ok: true as const };
    }

    if (parsed.data.intent === "cancel") {
      if (order.status === "cancelled") return { ok: false as const, error: "This order is already cancelled." };
      if (order.status === "delivered") return { ok: false as const, error: "A delivered order stays delivered." };
      if (!order.stockRestored) {
        for (const item of order.items) {
          const product = store.products.find((piece) => piece.id === item.productId);
          if (product) product.stock += item.qty;
        }
        order.stockRestored = true;
      }
      order.status = "cancelled";
      const copy = eventCopy("cancelled");
      order.events.push(makeEvent("cancelled", copy.label, parsed.data.note || copy.note));
      return { ok: true as const };
    }

    const upcoming = nextStatus(order.status);
    if (!upcoming) return { ok: false as const, error: "This order has nowhere further to go." };
    if (upcoming === "shipped") {
      order.courier = parsed.data.courier || "Studio courier";
      order.trackingCode = parsed.data.trackingCode || `COS-${order.number.slice(3)}`;
    }
    order.status = upcoming;
    const copy = eventCopy(upcoming, { courier: order.courier, trackingCode: order.trackingCode });
    order.events.push(makeEvent(upcoming, copy.label, parsed.data.note || copy.note));
    return { ok: true as const };
  });
}

export async function saveCoupon(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the offer." };
  if (parsed.data.type === "percent" && parsed.data.value > 80) {
    return { ok: false, error: "A percent offer can't be more than 80." };
  }
  const code = parsed.data.code.toUpperCase();
  return updateStore((store) => {
    store.coupons ??= [];
    const existing = store.coupons.find((item) => item.code === code);
    if (existing) {
      Object.assign(existing, { ...parsed.data, code });
      return { ok: true as const };
    }
    store.coupons.unshift({ ...parsed.data, code });
    return { ok: true as const };
  });
}

export async function markMessage(id: string, read: boolean): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  if (!id || id.length > 80) return { ok: false, error: "That note could not be updated." };
  const found = await updateStore((store) => {
    const message = store.messages.find((item) => item.id === id);
    if (!message) return false;
    message.read = read;
    return true;
  });
  if (!found) return { ok: false, error: "That note is no longer in the inbox." };
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  if (!id || id.length > 80) return { ok: false, error: "That piece could not be removed." };
  const found = await updateStore((store) => {
    const before = store.products.length;
    store.products = store.products.filter((item) => item.id !== id);
    return store.products.length < before;
  });
  if (!found) return { ok: false, error: "That piece is already gone." };
  return { ok: true };
}

export async function saveCategory(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the collection." };
  return updateStore((store) => {
    store.categories ??= [];
    const id = parsed.data.id || slugify(parsed.data.label) || "collection";
    const previous = store.categories.find((item) => item.id === id);
    const next: ShopCategory = {
      id,
      label: parsed.data.label,
      blurb: parsed.data.blurb,
      motif: parsed.data.motif,
      palette: parsed.data.palette,
      imageUrl: parsed.data.imageUrl || previous?.imageUrl || "",
    };
    if (!parsed.data.id && store.categories.some((item) => item.id === next.id)) {
      next.id = `${next.id}-${store.categories.length + 1}`;
    }
    const existing = store.categories.find((item) => item.id === next.id);
    if (existing) {
      existing.label = next.label;
      existing.blurb = next.blurb;
      existing.motif = next.motif;
      existing.palette = next.palette;
      existing.imageUrl = next.imageUrl;
      return { ok: true as const };
    }
    store.categories.push(next);
    return { ok: true as const };
  });
}

export async function deleteCategory(id: string): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  if (!id || id.length > 40) return { ok: false, error: "That collection could not be removed." };
  return updateStore((store) => {
    if (store.products.some((product) => product.category === id)) {
      return { ok: false as const, error: "Move or delete the pieces in this collection first." };
    }
    store.categories = (store.categories ?? []).filter((item) => item.id !== id);
    return { ok: true as const };
  });
}

export async function saveWhatsapp(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = whatsappSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the number." };
  await updateStore((store) => {
    store.whatsapp = parsed.data.whatsapp;
  });
  return { ok: true };
}
