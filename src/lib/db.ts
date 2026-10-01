import "server-only";
import { cache } from "react";
import { defaultCoupons } from "@/lib/coupons";
import { CATEGORIES } from "@/lib/domain";
import { themeId } from "@/lib/themes";
import { createSeed } from "@/lib/seed";
import { fetchCatalog, fetchStore, fetchTheme, fetchUserById, hasDeliveredPiece, readLocalSnapshot, resetSql, writeStore } from "@/lib/postgres-store";
import type { Store, User } from "@/lib/types";

let memory: Store | null = null;
let loading: Promise<Store> | null = null;
let queue: Promise<void> = Promise.resolve();

function hydrate(store: Store) {
  store.coupons ??= defaultCoupons();
  for (const user of store.users) user.addresses ??= [];
  for (const order of store.orders) {
    order.discount ??= 0;
    order.couponCode ??= "";
  }
  for (const review of store.reviews) review.userId ??= null;
  if (!store.categories?.length) store.categories = CATEGORIES.map((category) => ({ ...category, imageUrl: "" }));
  for (const product of store.products) product.imageUrl ??= "";
  for (const category of store.categories) category.imageUrl ??= "";
  store.whatsapp ??= "";
  store.theme = themeId(store.theme);
  return store;
}

async function load() {
  if (memory) return memory;
  if (!loading) {
    loading = (async () => {
      let store = await fetchStore();
      if (store.users.length === 0 && store.products.length === 0) {
        store = hydrate(readLocalSnapshot() ?? createSeed());
        await writeStore(store);
        store = await fetchStore();
      }
      memory = hydrate(store);
      return memory;
    })().finally(() => {
      loading = null;
    });
  }
  return loading;
}

export const readStore = cache(async () => {
  const store = await load();
  hydrate(store);
  return structuredClone(store);
});

async function readThemeOnce() {
  if (memory) return themeId(memory.theme);
  return fetchTheme();
}

export const readTheme = cache(async () => {
  try {
    return await readThemeOnce();
  } catch {
    await resetSql();
    try {
      return await readThemeOnce();
    } catch {
      return "blush" as const;
    }
  }
});

async function readCatalogOnce() {
  if (memory) {
    hydrate(memory);
    return {
      categories: memory.categories,
      products: memory.products,
      reviews: memory.reviews,
      whatsapp: memory.whatsapp ?? "",
    };
  }
  const catalog = await fetchCatalog();
  if (!catalog.categories.length) {
    catalog.categories = CATEGORIES.map((category) => ({ ...category, imageUrl: "" }));
  }
  return catalog;
}

export const readCatalog = cache(async () => {
  try {
    return await readCatalogOnce();
  } catch {
    await resetSql();
    return readCatalogOnce();
  }
});

export async function buyerReceived(userId: string, productId: string) {
  if (memory) {
    return memory.orders.some(
      (order) =>
        order.userId === userId &&
        order.status === "delivered" &&
        order.items.some((item) => item.productId === productId),
    );
  }
  return hasDeliveredPiece(userId, productId);
}

export const readUser = cache(async (id: string): Promise<User | null> => {
  if (memory) return memory.users.find((user) => user.id === id) ?? null;
  return fetchUserById(id);
});

export async function updateStore<T>(mutator: (store: Store) => T): Promise<T> {
  const run = queue.then(async () => {
    const store = await load();
    hydrate(store);
    const result = mutator(store);
    memory = store;
    await writeStore(store);
    return result;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
