import fs from "fs";
import path from "path";
import postgres from "postgres";
import { themeId } from "@/lib/themes";
import type { Coupon, Order, Product, Review, ShopCategory, Store, StudioMessage, Subscriber, User } from "@/lib/types";

let client: ReturnType<typeof postgres> | null = null;

type Db = postgres.Sql<Record<string, never>> | postgres.TransactionSql<Record<string, never>>;

function databaseUrl() {
  const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  return url;
}

export function getSql() {
  if (!client) {
    // max_pipeline is supported at runtime. The published types omit it.
    const options: postgres.Options<Record<string, never>> & { max_pipeline: number } = {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      // 0 never hands the connection to a transaction, so saves never run.
      // 1 keeps a single query in flight so the pooler cannot mix result columns.
      max_pipeline: 1,
    };
    client = postgres(databaseUrl(), options);
  }
  return client;
}

function iso(value: Date | string | null | undefined) {
  const date = value instanceof Date ? value : typeof value === "string" && value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "1970-01-01T00:00:00.000Z";
  return date.toISOString();
}

function asJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  if (value == null) return fallback;
  return value as T;
}

let themeCache: { value: ReturnType<typeof themeId>; at: number } | null = null;

export function clearThemeCache() {
  themeCache = null;
}

type StoreBundle = {
  meta: { key: string; value: string }[];
  users: { id: string; name: string; email: string; password_hash: string; role: "admin" | "customer"; phone: string; city: string; created_at: string }[];
  addresses: { id: string; user_id: string; label: string; line: string; city: string; phone: string }[];
  categories: { id: string; label: string; blurb: string; motif: Store["categories"][number]["motif"]; palette: Store["categories"][number]["palette"]; image_url: string; sort_order: number }[];
  products: { id: string; slug: string; name: string; description: string; price: number; compare_at: number | null; category: string; motif: Store["products"][number]["motif"]; palette: Store["products"][number]["palette"]; stock: number; featured: boolean; active: boolean; yarn: string; image_url: string; created_at: string }[];
  orders: { id: string; number: string; user_id: string | null; email: string; name: string; phone: string; address: string; city: string; notes: string; payment: Store["orders"][number]["payment"]; reference: string; subtotal: number; shipping: number; discount: number; coupon_code: string; total: number; status: Store["orders"][number]["status"]; courier: string; tracking_code: string; stock_restored: boolean; created_at: string }[];
  items: { id: string; order_id: string; product_id: string; name: string; price: number; qty: number; line_total: number }[];
  events: { id: string; order_id: string; status: Store["orders"][number]["events"][number]["status"]; label: string; note: string; at: string }[];
  reviews: { id: string; product_id: string | null; user_id: string | null; name: string; city: string; rating: number; body: string; created_at: string }[];
  messages: { id: string; name: string; email: string; topic: string; body: string; read: boolean; created_at: string }[];
  subscribers: { id: string; email: string; created_at: string }[];
  coupons: { code: string; label: string; type: Store["coupons"][number]["type"]; value: number; min_order: number; active: boolean }[];
};

function emptyBundle(): StoreBundle {
  return {
    meta: [],
    users: [],
    addresses: [],
    categories: [],
    products: [],
    orders: [],
    items: [],
    events: [],
    reviews: [],
    messages: [],
    subscribers: [],
    coupons: [],
  };
}

export async function fetchStore(sql: Db = getSql() as Db): Promise<Store> {
  const loaded = await sql<{ data: unknown }[]>`
    select json_build_object(
      'meta', coalesce((select json_agg(json_build_object('key', key, 'value', value)) from shop_meta), '[]'::json),
      'users', coalesce((select json_agg(json_build_object(
        'id', id, 'name', name, 'email', email, 'password_hash', password_hash,
        'role', role, 'phone', phone, 'city', city, 'created_at', created_at
      ) order by created_at) from users), '[]'::json),
      'addresses', coalesce((select json_agg(json_build_object(
        'id', id, 'user_id', user_id, 'label', label, 'line', line, 'city', city, 'phone', phone
      )) from addresses), '[]'::json),
      'categories', coalesce((select json_agg(json_build_object(
        'id', id, 'label', label, 'blurb', blurb, 'motif', motif, 'palette', palette,
        'image_url', image_url, 'sort_order', sort_order
      ) order by sort_order) from categories), '[]'::json),
      'products', coalesce((select json_agg(json_build_object(
        'id', id, 'slug', slug, 'name', name, 'description', description, 'price', price,
        'compare_at', compare_at, 'category', category, 'motif', motif, 'palette', palette,
        'stock', stock, 'featured', featured, 'active', active, 'yarn', yarn,
        'image_url', image_url, 'created_at', created_at
      ) order by created_at desc) from products), '[]'::json),
      'orders', coalesce((select json_agg(json_build_object(
        'id', id, 'number', number, 'user_id', user_id, 'email', email, 'name', name,
        'phone', phone, 'address', address, 'city', city, 'notes', notes, 'payment', payment,
        'reference', reference, 'subtotal', subtotal, 'shipping', shipping, 'discount', discount,
        'coupon_code', coupon_code, 'total', total, 'status', status, 'courier', courier,
        'tracking_code', tracking_code, 'stock_restored', stock_restored, 'created_at', created_at
      ) order by created_at desc) from orders), '[]'::json),
      'items', coalesce((select json_agg(json_build_object(
        'id', id, 'order_id', order_id, 'product_id', product_id, 'name', name,
        'price', price, 'qty', qty, 'line_total', line_total
      )) from order_items), '[]'::json),
      'events', coalesce((select json_agg(json_build_object(
        'id', id, 'order_id', order_id, 'status', status, 'label', label, 'note', note, 'at', at
      ) order by at) from tracking_events), '[]'::json),
      'reviews', coalesce((select json_agg(json_build_object(
        'id', id, 'product_id', product_id, 'user_id', user_id, 'name', name,
        'city', city, 'rating', rating, 'body', body, 'created_at', created_at
      ) order by created_at desc) from reviews), '[]'::json),
      'messages', coalesce((select json_agg(json_build_object(
        'id', id, 'name', name, 'email', email, 'topic', topic, 'body', body,
        'read', read, 'created_at', created_at
      ) order by created_at desc) from messages), '[]'::json),
      'subscribers', coalesce((select json_agg(json_build_object(
        'id', id, 'email', email, 'created_at', created_at
      ) order by created_at desc) from subscribers), '[]'::json),
      'coupons', coalesce((select json_agg(json_build_object(
        'code', code, 'label', label, 'type', type, 'value', value,
        'min_order', min_order, 'active', active
      )) from coupons), '[]'::json)
    ) as data
  `;
  const { meta, users, addresses, categories, products, orders, items, events, reviews, messages, subscribers, coupons } =
    asJson(loaded[0]?.data, emptyBundle());

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
      createdAt: iso(user.created_at),
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
      imageUrl: category.image_url ?? "",
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
      imageUrl: product.image_url ?? "",
      createdAt: iso(product.created_at),
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
      discount: order.discount ?? 0,
      couponCode: order.coupon_code ?? "",
      total: order.total,
      status: order.status,
      courier: order.courier,
      trackingCode: order.tracking_code,
      stockRestored: order.stock_restored,
      createdAt: iso(order.created_at),
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
          at: iso(event.at),
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
      createdAt: iso(review.created_at),
    })),
    messages: messages.map((message) => ({
      id: message.id,
      name: message.name,
      email: message.email,
      topic: message.topic,
      body: message.body,
      read: message.read,
      createdAt: iso(message.created_at),
    })),
    subscribers: subscribers.map((subscriber) => ({
      id: subscriber.id,
      email: subscriber.email,
      createdAt: iso(subscriber.created_at),
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

export async function fetchTheme() {
  if (themeCache && Date.now() - themeCache.at < 30_000) return themeCache.value;
  const sql = getSql();
  const rows = await sql<{ value: string }[]>`select value from shop_meta where key = 'theme'`;
  const value = themeId(rows[0]?.value);
  themeCache = { value, at: Date.now() };
  return value;
}

export async function fetchCatalog(): Promise<{
  categories: ShopCategory[];
  products: Product[];
  reviews: Review[];
  whatsapp: string;
}> {
  const sql = getSql();
  const loaded = await sql<{ data: unknown }[]>`
    select json_build_object(
      'meta', coalesce((select json_agg(json_build_object('key', key, 'value', value)) from shop_meta where key = 'whatsapp'), '[]'::json),
      'categories', coalesce((select json_agg(json_build_object(
        'id', id, 'label', label, 'blurb', blurb, 'motif', motif, 'palette', palette, 'image_url', image_url
      ) order by sort_order) from categories), '[]'::json),
      'products', coalesce((select json_agg(json_build_object(
        'id', id, 'slug', slug, 'name', name, 'description', description, 'price', price,
        'compare_at', compare_at, 'category', category, 'motif', motif, 'palette', palette,
        'stock', stock, 'featured', featured, 'active', active, 'yarn', yarn,
        'image_url', image_url, 'created_at', created_at
      ) order by created_at desc) from products), '[]'::json),
      'reviews', coalesce((select json_agg(json_build_object(
        'id', id, 'product_id', product_id, 'user_id', user_id, 'name', name,
        'city', city, 'rating', rating, 'body', body, 'created_at', created_at
      ) order by created_at desc) from reviews), '[]'::json)
    ) as data
  `;
  const { meta, categories, products, reviews } = asJson(loaded[0]?.data, {
    meta: [] as { key: string; value: string }[],
    categories: [] as { id: string; label: string; blurb: string; motif: ShopCategory["motif"]; palette: ShopCategory["palette"]; image_url: string }[],
    products: [] as { id: string; slug: string; name: string; description: string; price: number; compare_at: number | null; category: string; motif: Product["motif"]; palette: Product["palette"]; stock: number; featured: boolean; active: boolean; yarn: string; image_url: string; created_at: string }[],
    reviews: [] as { id: string; product_id: string | null; user_id: string | null; name: string; city: string; rating: number; body: string; created_at: string }[],
  });
  return {
    whatsapp: meta.find((row) => row.key === "whatsapp")?.value ?? "",
    categories: categories.map((category) => ({
      id: category.id,
      label: category.label,
      blurb: category.blurb,
      motif: category.motif,
      palette: category.palette,
      imageUrl: category.image_url ?? "",
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
      imageUrl: product.image_url ?? "",
      createdAt: iso(product.created_at),
    })),
    reviews: reviews.map((review) => ({
      id: review.id,
      productId: review.product_id,
      userId: review.user_id,
      name: review.name,
      city: review.city,
      rating: review.rating,
      text: review.body,
      createdAt: iso(review.created_at),
    })),
  };
}

async function fetchUserWhere(where: "id" | "email", value: string): Promise<User | null> {
  const sql = getSql();
  const userMatch = where === "email" ? sql`email = ${value}` : sql`id = ${value}`;
  const addressMatch = where === "email" ? sql`users.email = ${value}` : sql`users.id = ${value}`;
  const loaded = await sql<{ data: unknown }[]>`
    select json_build_object(
      'user', (
        select json_build_object(
          'id', id, 'name', name, 'email', email, 'password_hash', password_hash,
          'role', role, 'phone', phone, 'city', city, 'created_at', created_at
        )
        from users
        where ${userMatch}
        limit 1
      ),
      'addresses', coalesce((
        select json_agg(json_build_object(
          'id', addresses.id, 'label', addresses.label, 'line', addresses.line,
          'city', addresses.city, 'phone', addresses.phone
        ))
        from addresses
        join users on users.id = addresses.user_id
        where ${addressMatch}
      ), '[]'::json)
    ) as data
  `;
  const bundle = asJson(loaded[0]?.data, {
    user: null as { id: string; name: string; email: string; password_hash: string; role: User["role"]; phone: string; city: string; created_at: string } | null,
    addresses: [] as { id: string; label: string; line: string; city: string; phone: string }[],
  });
  const user = bundle.user;
  if (!user) return null;
  const addresses = bundle.addresses;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.password_hash,
    role: user.role,
    phone: user.phone,
    city: user.city,
    createdAt: iso(user.created_at),
    addresses: addresses.map((address) => ({
      id: address.id,
      label: address.label,
      line: address.line,
      city: address.city,
      phone: address.phone,
    })),
  };
}

export function fetchUserById(id: string) {
  return fetchUserWhere("id", id);
}

export function fetchUserByEmail(email: string) {
  return fetchUserWhere("email", email);
}

export async function fetchSellables(): Promise<{ products: Product[]; coupons: Coupon[] }> {
  const sql = getSql();
  const loaded = await sql<{ data: unknown }[]>`
    select json_build_object(
      'products', coalesce((select json_agg(json_build_object(
        'id', id, 'slug', slug, 'name', name, 'description', description, 'price', price,
        'compare_at', compare_at, 'category', category, 'motif', motif, 'palette', palette,
        'stock', stock, 'featured', featured, 'active', active, 'yarn', yarn,
        'image_url', image_url, 'created_at', created_at
      ) order by created_at desc) from products), '[]'::json),
      'coupons', coalesce((select json_agg(json_build_object(
        'code', code, 'label', label, 'type', type, 'value', value, 'min_order', min_order, 'active', active
      )) from coupons), '[]'::json)
    ) as data
  `;
  const bundle = asJson(loaded[0]?.data, {
    products: [] as StoreBundle["products"],
    coupons: [] as StoreBundle["coupons"],
  });
  return {
    products: bundle.products.map((product) => ({
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
      imageUrl: product.image_url ?? "",
      createdAt: iso(product.created_at),
    })),
    coupons: bundle.coupons.map((coupon) => ({
      code: coupon.code,
      label: coupon.label,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.min_order,
      active: coupon.active,
    })),
  };
}

function mapOrder(
  order: StoreBundle["orders"][number],
  items: StoreBundle["items"],
  events: StoreBundle["events"],
): Order {
  return {
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
    discount: order.discount ?? 0,
    couponCode: order.coupon_code ?? "",
    total: order.total,
    status: order.status,
    courier: order.courier,
    trackingCode: order.tracking_code,
    stockRestored: order.stock_restored,
    createdAt: iso(order.created_at),
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
        at: iso(event.at),
      })),
  };
}

export async function fetchOrderByNumber(number: string): Promise<Order | null> {
  const sql = getSql();
  const loaded = await sql<{ data: unknown }[]>`
    select (
      select json_build_object(
        'order', json_build_object(
          'id', orders.id, 'number', orders.number, 'user_id', orders.user_id, 'email', orders.email,
          'name', orders.name, 'phone', orders.phone, 'address', orders.address, 'city', orders.city,
          'notes', orders.notes, 'payment', orders.payment, 'reference', orders.reference,
          'subtotal', orders.subtotal, 'shipping', orders.shipping, 'discount', orders.discount,
          'coupon_code', orders.coupon_code, 'total', orders.total, 'status', orders.status,
          'courier', orders.courier, 'tracking_code', orders.tracking_code,
          'stock_restored', orders.stock_restored, 'created_at', orders.created_at
        ),
        'items', coalesce((
          select json_agg(json_build_object(
            'id', order_items.id, 'order_id', order_items.order_id, 'product_id', order_items.product_id,
            'name', order_items.name, 'price', order_items.price, 'qty', order_items.qty, 'line_total', order_items.line_total
          )) from order_items where order_items.order_id = orders.id
        ), '[]'::json),
        'events', coalesce((
          select json_agg(json_build_object(
            'id', tracking_events.id, 'order_id', tracking_events.order_id, 'status', tracking_events.status,
            'label', tracking_events.label, 'note', tracking_events.note, 'at', tracking_events.at
          ) order by tracking_events.at) from tracking_events where tracking_events.order_id = orders.id
        ), '[]'::json)
      )
      from orders
      where orders.number = ${number}
    ) as data
  `;
  const bundle = asJson(loaded[0]?.data, null as { order: StoreBundle["orders"][number]; items: StoreBundle["items"]; events: StoreBundle["events"] } | null);
  if (!bundle?.order) return null;
  return mapOrder(bundle.order, bundle.items, bundle.events);
}

export async function fetchOrdersForUser(userId: string): Promise<Order[]> {
  const sql = getSql();
  const loaded = await sql<{ data: unknown }[]>`
    select coalesce((
      select json_agg(json_build_object(
        'order', json_build_object(
          'id', orders.id, 'number', orders.number, 'user_id', orders.user_id, 'email', orders.email,
          'name', orders.name, 'phone', orders.phone, 'address', orders.address, 'city', orders.city,
          'notes', orders.notes, 'payment', orders.payment, 'reference', orders.reference,
          'subtotal', orders.subtotal, 'shipping', orders.shipping, 'discount', orders.discount,
          'coupon_code', orders.coupon_code, 'total', orders.total, 'status', orders.status,
          'courier', orders.courier, 'tracking_code', orders.tracking_code,
          'stock_restored', orders.stock_restored, 'created_at', orders.created_at
        ),
        'items', coalesce((
          select json_agg(json_build_object(
            'id', order_items.id, 'order_id', order_items.order_id, 'product_id', order_items.product_id,
            'name', order_items.name, 'price', order_items.price, 'qty', order_items.qty, 'line_total', order_items.line_total
          )) from order_items where order_items.order_id = orders.id
        ), '[]'::json),
        'events', coalesce((
          select json_agg(json_build_object(
            'id', tracking_events.id, 'order_id', tracking_events.order_id, 'status', tracking_events.status,
            'label', tracking_events.label, 'note', tracking_events.note, 'at', tracking_events.at
          ) order by tracking_events.at) from tracking_events where tracking_events.order_id = orders.id
        ), '[]'::json)
      ) order by orders.created_at desc)
      from orders
      where orders.user_id = ${userId}
    ), '[]'::json) as data
  `;
  const rows = asJson(loaded[0]?.data, [] as { order: StoreBundle["orders"][number]; items: StoreBundle["items"]; events: StoreBundle["events"] }[]);
  return rows.map((row) => mapOrder(row.order, row.items, row.events));
}

export async function hasDeliveredPiece(userId: string, productId: string) {
  const sql = getSql();
  const rows = await sql<{ id: string }[]>`
    select orders.id
    from orders
    join order_items on order_items.order_id = orders.id
    where orders.user_id = ${userId}
      and orders.status = 'delivered'
      and order_items.product_id = ${productId}
    limit 1
  `;
  return rows.length > 0;
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

function changed<T>(before: T[], after: T[], key: (item: T) => string) {
  const previous = new Map(before.map((item) => [key(item), item]));
  const next = new Map(after.map((item) => [key(item), item]));
  const inserted: T[] = [];
  const updated: T[] = [];
  const deleted: string[] = [];
  for (const [id, item] of next) {
    const prior = previous.get(id);
    if (!prior) inserted.push(item);
    else if (JSON.stringify(prior) !== JSON.stringify(item)) updated.push(item);
  }
  for (const id of previous.keys()) {
    if (!next.has(id)) deleted.push(id);
  }
  return { inserted, updated, deleted };
}

function userProfile(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role,
    phone: user.phone,
    city: user.city,
    createdAt: user.createdAt,
  };
}

export async function persistDiff(tx: Db, before: Store, after: Store) {
  if (JSON.stringify(before) === JSON.stringify(after)) return;

  const users = changed(before.users.map(userProfile), after.users.map(userProfile), (user) => user.id);
  if (users.inserted.length) {
    await tx`insert into users ${tx(users.inserted.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password_hash: user.passwordHash,
      role: user.role,
      phone: user.phone,
      city: user.city,
      created_at: user.createdAt,
    })))}`;
  }
  for (const user of users.updated) {
    await tx`
      update users set
        name = ${user.name},
        email = ${user.email},
        password_hash = ${user.passwordHash},
        role = ${user.role},
        phone = ${user.phone},
        city = ${user.city},
        created_at = ${user.createdAt}
      where id = ${user.id}
    `;
  }

  const addressUsers = after.users.filter((user) => {
    const prior = before.users.find((item) => item.id === user.id);
    if (!prior) return true;
    return JSON.stringify(prior.addresses ?? []) !== JSON.stringify(user.addresses ?? []);
  });
  if (addressUsers.length) {
    await tx`delete from addresses where user_id in ${tx(addressUsers.map((user) => user.id))}`;
    const addresses = addressUsers.flatMap((user) =>
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
  }

  const categories = changed(before.categories ?? [], after.categories ?? [], (category) => category.id);
  const categoryOrder = new Map((after.categories ?? []).map((category, index) => [category.id, index]));
  if (categories.inserted.length) {
    await tx`insert into categories ${tx(categories.inserted.map((category) => ({
      id: category.id,
      label: category.label,
      blurb: category.blurb,
      motif: category.motif,
      palette: category.palette,
      image_url: category.imageUrl ?? "",
      sort_order: categoryOrder.get(category.id) ?? 0,
    })))}`;
  }
  for (const category of categories.updated) {
    await tx`
      update categories set
        label = ${category.label},
        blurb = ${category.blurb},
        motif = ${category.motif},
        palette = ${category.palette},
        image_url = ${category.imageUrl ?? ""}
      where id = ${category.id}
    `;
  }

  const products = changed(before.products ?? [], after.products ?? [], (product) => product.id);
  if (products.inserted.length) {
    await tx`insert into products ${tx(products.inserted.map(productRow))}`;
  }
  for (const product of products.updated) {
    await tx`
      update products set
        slug = ${product.slug},
        name = ${product.name},
        description = ${product.description},
        price = ${product.price},
        compare_at = ${product.compareAt},
        category = ${product.category},
        motif = ${product.motif},
        palette = ${product.palette},
        stock = ${product.stock},
        featured = ${product.featured},
        active = ${product.active},
        yarn = ${product.yarn},
        image_url = ${product.imageUrl ?? ""},
        created_at = ${product.createdAt}
      where id = ${product.id}
    `;
  }

  const orders = changed(before.orders ?? [], after.orders ?? [], (order) => order.id);
  if (orders.inserted.length) await tx`insert into orders ${tx(orders.inserted.map(orderRow))}`;
  for (const order of orders.updated) {
    const row = orderRow(order);
    await tx`
      update orders set
        number = ${row.number},
        user_id = ${row.user_id},
        email = ${row.email},
        name = ${row.name},
        phone = ${row.phone},
        address = ${row.address},
        city = ${row.city},
        notes = ${row.notes},
        payment = ${row.payment},
        reference = ${row.reference},
        subtotal = ${row.subtotal},
        shipping = ${row.shipping},
        discount = ${row.discount},
        coupon_code = ${row.coupon_code},
        total = ${row.total},
        status = ${row.status},
        courier = ${row.courier},
        tracking_code = ${row.tracking_code},
        stock_restored = ${row.stock_restored},
        created_at = ${row.created_at}
      where id = ${row.id}
    `;
  }
  const touchedOrders = [...orders.inserted, ...orders.updated];
  if (touchedOrders.length) await replaceOrderChildren(tx, touchedOrders);

  if (orders.deleted.length) await tx`delete from orders where id in ${tx(orders.deleted)}`;
  if (products.deleted.length) await tx`delete from products where id in ${tx(products.deleted)}`;
  if (categories.deleted.length) await tx`delete from categories where id in ${tx(categories.deleted)}`;

  const reviews = changed(before.reviews ?? [], after.reviews ?? [], (review) => review.id);
  if (reviews.inserted.length) await tx`insert into reviews ${tx(reviews.inserted.map(reviewRow))}`;
  for (const review of reviews.updated) {
    const row = reviewRow(review);
    await tx`
      update reviews set
        product_id = ${row.product_id},
        user_id = ${row.user_id},
        name = ${row.name},
        city = ${row.city},
        rating = ${row.rating},
        body = ${row.body},
        created_at = ${row.created_at}
      where id = ${row.id}
    `;
  }
  if (reviews.deleted.length) await tx`delete from reviews where id in ${tx(reviews.deleted)}`;

  const messages = changed(before.messages ?? [], after.messages ?? [], (message) => message.id);
  if (messages.inserted.length) await tx`insert into messages ${tx(messages.inserted.map(messageRow))}`;
  for (const message of messages.updated) {
    const row = messageRow(message);
    await tx`
      update messages set
        name = ${row.name},
        email = ${row.email},
        topic = ${row.topic},
        body = ${row.body},
        read = ${row.read},
        created_at = ${row.created_at}
      where id = ${row.id}
    `;
  }
  if (messages.deleted.length) await tx`delete from messages where id in ${tx(messages.deleted)}`;

  const subscribers = changed(before.subscribers ?? [], after.subscribers ?? [], (subscriber) => subscriber.id);
  if (subscribers.inserted.length) await tx`insert into subscribers ${tx(subscribers.inserted.map(subscriberRow))}`;
  for (const subscriber of subscribers.updated) {
    const row = subscriberRow(subscriber);
    await tx`
      update subscribers set email = ${row.email}, created_at = ${row.created_at}
      where id = ${row.id}
    `;
  }
  if (subscribers.deleted.length) await tx`delete from subscribers where id in ${tx(subscribers.deleted)}`;

  const coupons = changed(before.coupons ?? [], after.coupons ?? [], (coupon) => coupon.code);
  if (coupons.inserted.length) await tx`insert into coupons ${tx(coupons.inserted.map(couponRow))}`;
  for (const coupon of coupons.updated) {
    const row = couponRow(coupon);
    await tx`
      update coupons set
        label = ${row.label},
        type = ${row.type},
        value = ${row.value},
        min_order = ${row.min_order},
        active = ${row.active}
      where code = ${row.code}
    `;
  }
  if (coupons.deleted.length) await tx`delete from coupons where code in ${tx(coupons.deleted)}`;

  if (users.deleted.length) await tx`delete from users where id in ${tx(users.deleted)}`;

  if (before.seq !== after.seq) await upsertMeta(tx, "seq", String(after.seq));
  if ((before.whatsapp ?? "") !== (after.whatsapp ?? "")) await upsertMeta(tx, "whatsapp", after.whatsapp ?? "");
  if (themeId(before.theme) !== themeId(after.theme)) await upsertMeta(tx, "theme", themeId(after.theme));
}

function productRow(product: Product) {
  return {
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
  };
}

function orderRow(order: Order) {
  return {
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
  };
}

async function replaceOrderChildren(tx: Db, orders: Order[]) {
  const ids = orders.map((order) => order.id);
  await tx`delete from tracking_events where order_id in ${tx(ids)}`;
  await tx`delete from order_items where order_id in ${tx(ids)}`;
  const items = orders.flatMap((order) =>
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
  if (items.length) await tx`insert into order_items ${tx(items)}`;
  const events = orders.flatMap((order) =>
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
}

function reviewRow(review: Review) {
  return {
    id: review.id,
    product_id: review.productId,
    user_id: review.userId,
    name: review.name,
    city: review.city,
    rating: review.rating,
    body: review.text,
    created_at: review.createdAt,
  };
}

function messageRow(message: StudioMessage) {
  return {
    id: message.id,
    name: message.name,
    email: message.email,
    topic: message.topic,
    body: message.body,
    read: message.read,
    created_at: message.createdAt,
  };
}

function subscriberRow(subscriber: Subscriber) {
  return {
    id: subscriber.id,
    email: subscriber.email,
    created_at: subscriber.createdAt,
  };
}

function couponRow(coupon: Coupon) {
  return {
    code: coupon.code,
    label: coupon.label,
    type: coupon.type,
    value: coupon.value,
    min_order: coupon.minOrder,
    active: coupon.active,
  };
}

async function upsertMeta(tx: Db, key: string, value: string) {
  await tx`
    insert into shop_meta (key, value) values (${key}, ${value})
    on conflict (key) do update set value = excluded.value
  `;
}

export function localSnapshotPath() {
  return path.join(process.cwd(), "data", "store.json");
}

export function readLocalSnapshot() {
  const file = localSnapshotPath();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Store;
}
