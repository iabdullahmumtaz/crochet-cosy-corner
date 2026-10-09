import "server-only";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { connection } from "next/server";
import { defaultCoupons } from "@/lib/coupons";
import { CATEGORIES } from "@/lib/domain";
import { themeId } from "@/lib/themes";
import { createSeed } from "@/lib/seed";
import { clearThemeCache, fetchCatalog, fetchOrderByNumber, fetchOrdersForUser, fetchSellables, fetchStore, fetchTheme, fetchUserByEmail, fetchUserById, getSql, hasDeliveredPiece, persistDiff, readLocalSnapshot, writeStore } from "@/lib/postgres-store";
import type { Store, User } from "@/lib/types";

let queue: Promise<void> = Promise.resolve();
let seeding: Promise<Store> | null = null;

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

async function seedIfEmpty(store: Store) {
  if (store.users.length > 0 || store.products.length > 0) return store;
  if (!seeding) {
    seeding = (async () => {
      const seeded = hydrate(structuredClone(readLocalSnapshot() ?? createSeed()));
      await writeStore(seeded);
      return fetchStore();
    })().finally(() => {
      seeding = null;
    });
  }
  return seeding;
}

export const readStore = cache(async () => {
  await connection();
  const store = await seedIfEmpty(await fetchStore());
  return structuredClone(hydrate(store));
});

export const readTheme = cache(async () => {
  try {
    await connection();
    return await fetchTheme();
  } catch {
    return "blush" as const;
  }
});

export const readCatalog = cache(async () => {
  await connection();
  const catalog = await fetchCatalog();
  if (!catalog.categories.length) {
    catalog.categories = CATEGORIES.map((category) => ({ ...category, imageUrl: "" }));
  }
  for (const product of catalog.products) product.imageUrl ??= "";
  for (const category of catalog.categories) category.imageUrl ??= "";
  return structuredClone(catalog);
});

export async function buyerReceived(userId: string, productId: string) {
  return hasDeliveredPiece(userId, productId);
}

export const readUser = cache(async (id: string): Promise<User | null> => {
  await connection();
  return fetchUserById(id);
});

export const readUserByEmail = cache(async (email: string): Promise<User | null> => {
  await connection();
  return fetchUserByEmail(email);
});

export const readSellables = cache(async () => {
  await connection();
  return fetchSellables();
});

export const readOrdersForUser = cache(async (userId: string) => {
  await connection();
  return fetchOrdersForUser(userId);
});

export const readOrderByNumber = cache(async (number: string) => {
  await connection();
  return fetchOrderByNumber(number);
});

function publishShop() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

export async function updateStore<T>(mutator: (store: Store) => T): Promise<T> {
  const run = queue.then(async () => {
    const sql = getSql();
    try {
      const result = (await sql.begin(async (tx) => {
        await tx`insert into shop_meta (key, value) values ('seq', '1905') on conflict (key) do nothing`;
        await tx`select value from shop_meta where key = 'seq' for update`;
        const current = await fetchStore(tx);
        const before = structuredClone(current);
        const store = hydrate(structuredClone(current));
        const value = mutator(store);
        await persistDiff(tx, before, store);
        return value;
      })) as T;
      clearThemeCache();
      try {
        publishShop();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Refresh failed";
        console.error("shop refresh failed", message);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed";
      console.error("shop save failed", message);
      throw new Error("The save did not reach the shop.");
    }
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
