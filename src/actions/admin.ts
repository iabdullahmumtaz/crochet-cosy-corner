"use server";

import { requireRole } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { eventCopy, makeEvent, nextStatus } from "@/lib/order-flow";
import { slugify } from "@/lib/format";
import { uploadShopImage } from "@/lib/storage";
import { categorySchema, couponSchema, customerUpdateSchema, nextNumberSchema, orderUpdateSchema, productSchema, themeSchema, whatsappSchema } from "@/lib/validators";
import type { ActionFail, ActionOk, Order, OrderStatus, Product, ShopCategory } from "@/lib/types";

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

function restoreStock(store: { products: Product[] }, order: Order) {
  if (order.stockRestored) return;
  for (const item of order.items) {
    const product = store.products.find((piece) => piece.id === item.productId);
    if (product) product.stock += item.qty;
  }
  order.stockRestored = true;
}

function takeStock(store: { products: Product[] }, order: Order): string | null {
  if (!order.stockRestored) return null;
  for (const item of order.items) {
    const product = store.products.find((piece) => piece.id === item.productId);
    if (!product || product.stock < item.qty) return `${item.name} does not have enough left to reopen this order.`;
  }
  for (const item of order.items) {
    const product = store.products.find((piece) => piece.id === item.productId);
    if (product) product.stock -= item.qty;
  }
  order.stockRestored = false;
  return null;
}

function applyStatus(store: { products: Product[] }, order: Order, status: OrderStatus, note: string, courier: string, trackingCode: string): ActionOk | ActionFail {
  if (courier) order.courier = courier;
  if (trackingCode) order.trackingCode = trackingCode;
  if (status === order.status) {
    if (note) order.events.push(makeEvent("note", "Studio note", note));
    return { ok: true };
  }
  if (status === "cancelled") {
    if (order.status === "delivered") return { ok: false, error: "A delivered order stays delivered." };
    restoreStock(store, order);
  } else if (order.status === "cancelled") {
    const blocked = takeStock(store, order);
    if (blocked) return { ok: false, error: blocked };
  }
  if (status === "shipped" || status === "out_for_delivery") {
    order.courier = order.courier || "Studio courier";
    order.trackingCode = order.trackingCode || `COS-${order.number.slice(3)}`;
  }
  order.status = status;
  const copy = eventCopy(status, { courier: order.courier, trackingCode: order.trackingCode });
  order.events.push(makeEvent(status, copy.label, note || copy.note));
  return { ok: true };
}

export async function updateOrder(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = orderUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "That update could not be read." };

  return updateStore((store) => {
    const order = store.orders.find((item) => item.number === parsed.data.number);
    if (!order) return { ok: false as const, error: "That order is not in the book." };

    if (parsed.data.intent === "note") {
      if (!parsed.data.note) return { ok: false as const, error: "Write a note first." };
      order.events.push(makeEvent("note", "Studio note", parsed.data.note));
      return { ok: true as const };
    }

    if (parsed.data.intent === "details") {
      if (parsed.data.name) order.name = parsed.data.name;
      if (parsed.data.phone !== undefined) order.phone = parsed.data.phone;
      if (parsed.data.address) order.address = parsed.data.address;
      if (parsed.data.city) order.city = parsed.data.city;
      order.courier = parsed.data.courier;
      order.trackingCode = parsed.data.trackingCode;
      return { ok: true as const };
    }

    if (parsed.data.intent === "cancel") {
      return applyStatus(store, order, "cancelled", parsed.data.note, parsed.data.courier, parsed.data.trackingCode);
    }

    if (parsed.data.intent === "set") {
      if (!parsed.data.status) return { ok: false as const, error: "Choose a status." };
      return applyStatus(store, order, parsed.data.status, parsed.data.note, parsed.data.courier, parsed.data.trackingCode);
    }

    const upcoming = nextStatus(order.status);
    if (!upcoming) return { ok: false as const, error: "This order has nowhere further to go." };
    return applyStatus(store, order, upcoming, parsed.data.note, parsed.data.courier, parsed.data.trackingCode);
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

export async function deleteCoupon(code: string): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const clean = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,20}$/.test(clean)) return { ok: false, error: "That offer could not be removed." };
  const found = await updateStore((store) => {
    const before = store.coupons.length;
    store.coupons = store.coupons.filter((item) => item.code !== clean);
    return store.coupons.length < before;
  });
  if (!found) return { ok: false, error: "That offer is already gone." };
  return { ok: true };
}

export async function updateCustomer(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = customerUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the customer." };
  const found = await updateStore((store) => {
    const user = store.users.find((item) => item.id === parsed.data.id && item.role === "customer");
    if (!user) return false;
    user.name = parsed.data.name;
    user.phone = parsed.data.phone;
    user.city = parsed.data.city;
    return true;
  });
  if (!found) return { ok: false, error: "That shopper is not in the book." };
  return { ok: true };
}

export async function saveNextNumber(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = nextNumberSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the next order number." };
  return updateStore((store) => {
    const highest = store.orders.reduce((max, order) => {
      const value = Number(order.number.replace("CC-", ""));
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);
    if (parsed.data.seq <= highest) {
      return { ok: false as const, error: `The next number has to be higher than CC-${highest}.` };
    }
    store.seq = parsed.data.seq;
    return { ok: true as const };
  });
}

export async function removeSubscriber(id: string): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  if (!id || id.length > 80) return { ok: false, error: "That address could not be removed." };
  const found = await updateStore((store) => {
    store.subscribers ??= [];
    const before = store.subscribers.length;
    store.subscribers = store.subscribers.filter((item) => item.id !== id);
    return store.subscribers.length < before;
  });
  if (!found) return { ok: false, error: "That address is already gone." };
  return { ok: true };
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

export async function saveTheme(input: unknown): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  const parsed = themeSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Choose one of the four themes." };
  await updateStore((store) => {
    store.theme = parsed.data.theme;
  });
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ActionOk | ActionFail> {
  const admin = await requireRole("admin");
  if (!admin) return { ok: false, error: "Sign in to the studio desk." };
  if (!id || id.length > 80) return { ok: false, error: "That review could not be removed." };
  const found = await updateStore((store) => {
    const before = store.reviews.length;
    store.reviews = store.reviews.filter((item) => item.id !== id);
    return store.reviews.length < before;
  });
  if (!found) return { ok: false, error: "That review is already gone." };
  return { ok: true };
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
