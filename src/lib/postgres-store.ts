import fs from "fs";
import path from "path";
import postgres from "postgres";
import { themeId } from "@/lib/themes";
import type { Store } from "@/lib/types";

let client: ReturnType<typeof postgres> | null = null;

function databaseUrl() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  return url;
}

export function getSql() {
  if (!client) {
    client = postgres(databaseUrl(), { prepare: false, max: 3, idle_timeout: 20, connect_timeout: 20 });
  }
  return client;
}

export async function fetchStore(): Promise<Store> {
  const sql = getSql();
  const [meta, users, addresses, categories, products, orders, items, events, reviews, messages, subscribers, coupons] =
    await Promise.all([
      sql<{ key: string; value: string }[]>`select key, value from shop_meta`,
      sql<{ id: string; name: string; email: string; password_hash: string; role: "admin" | "customer"; phone: string; city: string; created_at: Date }[]>`select * from users order by created_at`,
      sql<{ id: string; user_id: string; label: string; line: string; city: string; phone: string }[]>`select * from addresses`,
      sql<{ id: string; label: string; blurb: string; motif: Store["categories"][number]["motif"]; palette: Store["categories"][number]["palette"]; image_url: string; sort_order: number }[]>`select * from categories order by sort_order`,
      sql<{ id: string; slug: string; name: string; description: string; price: number; compare_at: number | null; category: string; motif: Store["products"][number]["motif"]; palette: Store["products"][number]["palette"]; stock: number; featured: boolean; active: boolean; yarn: string; image_url: string; created_at: Date }[]>`select * from products order by created_at desc`,
      sql<{ id: string; number: string; user_id: string | null; email: string; name: string; phone: string; address: string; city: string; notes: string; payment: Store["orders"][number]["payment"]; reference: string; subtotal: number; shipping: number; discount: number; coupon_code: string; total: number; status: Store["orders"][number]["status"]; courier: string; tracking_code: string; stock_restored: boolean; created_at: Date }[]>`select * from orders order by created_at desc`,
      sql<{ id: string; order_id: string; product_id: string; name: string; price: number; qty: number; line_total: number }[]>`select * from order_items`,
      sql<{ id: string; order_id: string; status: Store["orders"][number]["events"][number]["status"]; label: string; note: string; at: Date }[]>`select * from tracking_events order by at`,
      sql<{ id: string; product_id: string | null; user_id: string | null; name: string; city: string; rating: number; body: string; created_at: Date }[]>`select * from reviews order by created_at desc`,
      sql<{ id: string; name: string; email: string; topic: string; body: string; read: boolean; created_at: Date }[]>`select * from messages order by created_at desc`,
      sql<{ id: string; email: string; created_at: Date }[]>`select * from subscribers order by created_at desc`,
      sql<{ code: string; label: string; type: Store["coupons"][number]["type"]; value: number; min_order: number; active: boolean }[]>`select * from coupons`,
    ]);

  const metaMap = new Map(meta.map((row) => [row.key, row.value]));
  return {
    seq: Number(metaMap.get("seq") ?? 1905),
    whatsapp: metaMap.get("whatsapp") ?? "",
    theme: themeId(metaMap.get("theme")),
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.password_hash,
      role: user.role,
      phone: user.phone,
      city: user.city,
      createdAt: user.created_at.toISOString(),
      addresses: addresses
        .filter((address) => address.user_id === user.id)
        .map((address) => ({
          id: address.id,
          label: address.label,
          line: address.line,
          city: address.city,
          phone: address.phone,
        })),
    })),
    categories: categories.map((category) => ({
      id: category.id,
      label: category.label,
      blurb: category.blurb,
      motif: category.motif,
      palette: category.palette,
      imageUrl: category.image_url,
    })),
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAt: product.compare_at,
      category: product.category,
      motif: product.motif,
      palette: product.palette,
      stock: product.stock,
      featured: product.featured,
      active: product.active,
      yarn: product.yarn,
      imageUrl: product.image_url,
      createdAt: product.created_at.toISOString(),
    })),
    orders: orders.map((order) => ({
      id: order.id,
      number: order.number,
      userId: order.user_id,
      email: order.email,
      name: order.name,
      phone: order.phone,
      address: order.address,
      city: order.city,
      notes: order.notes,
      payment: order.payment,
      reference: order.reference,
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount,
      couponCode: order.coupon_code,
      total: order.total,
      status: order.status,
      courier: order.courier,
      trackingCode: order.tracking_code,
      stockRestored: order.stock_restored,
      createdAt: order.created_at.toISOString(),
      items: items
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          productId: item.product_id,
          name: item.name,
          price: item.price,
          qty: item.qty,
          lineTotal: item.line_total,
        })),
      events: events
        .filter((event) => event.order_id === order.id)
        .map((event) => ({
          id: event.id,
          status: event.status,
          label: event.label,
          note: event.note,
          at: event.at.toISOString(),
        })),
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      productId: review.product_id,
      userId: review.user_id,
      name: review.name,
      city: review.city,
      rating: review.rating,
      text: review.body,
      createdAt: review.created_at.toISOString(),
    })),
    messages: messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      topic: message.topic,
      body: message.body,
      read: message.read,
      createdAt: message.created_at.toISOString(),
    })),
    subscribers: subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      createdAt: subscriber.created_at.toISOString(),
    })),
    coupons: coupons.map((coupon) => ({
      code: coupon.code,
      label: coupon.label,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.min_order,
      active: coupon.active,
    })),
  };
}

export async function writeStore(store: Store) {
  store.categories ??= [];
  store.coupons ??= [];
  store.products ??= [];
  store.orders ??= [];
  store.reviews ??= [];
  store.messages ??= [];
  store.subscribers ??= [];
  store.users ??= [];
  store.whatsapp ??= "";
  store.theme = themeId(store.theme);
  const sql = getSql();
  await sql.begin(async (tx) => {
    await tx`delete from tracking_events`;
    await tx`delete from order_items`;
    await tx`delete from orders`;
    await tx`delete from reviews`;
    await tx`delete from products`;
    await tx`delete from categories`;
    await tx`delete from addresses`;
    await tx`delete from users`;
    await tx`delete from messages`;
    await tx`delete from subscribers`;
    await tx`delete from coupons`;
    await tx`delete from shop_meta`;

    if (store.users.length) {
      await tx`insert into users ${tx(
        store.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          password_hash: user.passwordHash,
          role: user.role,
          phone: user.phone,
          city: user.city,
          created_at: user.createdAt,
        })),
      )}`;
    }
    const addresses = store.users.flatMap((user) =>
      (user.addresses ?? []).map((address) => ({
        id: address.id,
        user_id: user.id,
        label: address.label,
        line: address.line,
        city: address.city,
        phone: address.phone,
      })),
    );
    if (addresses.length) await tx`insert into addresses ${tx(addresses)}`;
    if (store.categories.length) {
      await tx`insert into categories ${tx(
        store.categories.map((category, index) => ({
          id: category.id,
          label: category.label,
          blurb: category.blurb,
          motif: category.motif,
          palette: category.palette,
          image_url: category.imageUrl ?? "",
          sort_order: index,
        })),
      )}`;
    }
    if (store.products.length) {
      await tx`insert into products ${tx(
        store.products.map((product) => ({
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          price: product.price,
          compare_at: product.compareAt,
          category: product.category,
          motif: product.motif,
          palette: product.palette,
          stock: product.stock,
          featured: product.featured,
          active: product.active,
          yarn: product.yarn,
          image_url: product.imageUrl ?? "",
          created_at: product.createdAt,
        })),
      )}`;
    }
    if (store.orders.length) {
      await tx`insert into orders ${tx(
        store.orders.map((order) => ({
          id: order.id,
          number: order.number,
          user_id: order.userId,
          email: order.email,
          name: order.name,
          phone: order.phone,
          address: order.address,
          city: order.city,
          notes: order.notes,
          payment: order.payment,
          reference: order.reference,
          subtotal: order.subtotal,
          shipping: order.shipping,
          discount: order.discount ?? 0,
          coupon_code: order.couponCode ?? "",
          total: order.total,
          status: order.status,
          courier: order.courier,
          tracking_code: order.trackingCode,
          stock_restored: order.stockRestored,
          created_at: order.createdAt,
        })),
      )}`;
    }
    const orderItems = store.orders.flatMap((order) =>
      order.items.map((item) => ({
        id: crypto.randomUUID(),
        order_id: order.id,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        line_total: item.lineTotal,
      })),
    );
    if (orderItems.length) await tx`insert into order_items ${tx(orderItems)}`;
    const events = store.orders.flatMap((order) =>
      order.events.map((event) => ({
        id: event.id,
        order_id: order.id,
        status: event.status,
        label: event.label,
        note: event.note,
        at: event.at,
      })),
    );
    if (events.length) await tx`insert into tracking_events ${tx(events)}`;
    if (store.reviews.length) {
      await tx`insert into reviews ${tx(
        store.reviews.map((review) => ({
          id: review.id,
          product_id: review.productId,
          user_id: review.userId,
          name: review.name,
          city: review.city,
          rating: review.rating,
          body: review.text,
          created_at: review.createdAt,
        })),
      )}`;
    }
    if (store.messages.length) {
      await tx`insert into messages ${tx(
        store.messages.map((message) => ({
          id: message.id,
          name: message.name,
          email: message.email,
          topic: message.topic,
          body: message.body,
          read: message.read,
          created_at: message.createdAt,
        })),
      )}`;
    }
    if (store.subscribers.length) {
      await tx`insert into subscribers ${tx(
        store.subscribers.map((subscriber) => ({
          id: subscriber.id,
          email: subscriber.email,
          created_at: subscriber.createdAt,
        })),
      )}`;
    }
    if (store.coupons.length) {
      await tx`insert into coupons ${tx(
        store.coupons.map((coupon) => ({
          code: coupon.code,
          label: coupon.label,
          type: coupon.type,
          value: coupon.value,
          min_order: coupon.minOrder,
          active: coupon.active,
        })),
      )}`;
    }
    await tx`insert into shop_meta ${tx([
      { key: "seq", value: String(store.seq) },
      { key: "whatsapp", value: store.whatsapp ?? "" },
      { key: "theme", value: themeId(store.theme) },
    ])}`;
  });
}

export function localSnapshotPath() {
  return path.join(process.cwd(), "data", "store.json");
}

export function readLocalSnapshot() {
  const file = localSnapshotPath();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Store;
}
