import "server-only";
import { defaultCoupons } from "@/lib/coupons";
import { CATEGORIES } from "@/lib/domain";
import { createSeed } from "@/lib/seed";
import { fetchStore, readLocalSnapshot, writeStore } from "@/lib/postgres-store";
import type { Store } from "@/lib/types";

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

export async function readStore() {
  const store = await load();
  hydrate(store);
  return structuredClone(store);
}

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
