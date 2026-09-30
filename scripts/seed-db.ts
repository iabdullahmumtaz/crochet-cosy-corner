import fs from "fs";
import { CATEGORIES } from "../src/lib/domain";
import { defaultCoupons } from "../src/lib/coupons";
import { createSeed } from "../src/lib/seed";
import { fetchStore, readLocalSnapshot, writeStore } from "../src/lib/postgres-store";
import type { Store } from "../src/lib/types";

for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index <= 0 || line.startsWith("#")) continue;
  const key = line.slice(0, index);
  if (!process.env[key]) process.env[key] = line.slice(index + 1);
}

function ready(store: Store) {
  store.whatsapp ??= "";
  store.coupons ??= defaultCoupons();
  store.categories = store.categories?.length
    ? store.categories
    : CATEGORIES.map((category) => ({ ...category, imageUrl: "" }));
  for (const product of store.products) product.imageUrl ??= "";
  for (const category of store.categories) category.imageUrl ??= "";
  for (const user of store.users) user.addresses ??= [];
  for (const order of store.orders) {
    order.discount ??= 0;
    order.couponCode ??= "";
  }
  for (const review of store.reviews) review.userId ??= null;
  return store;
}

async function main() {
  const store = ready(readLocalSnapshot() ?? createSeed());
  const admin = store.users.find((user) => user.role === "admin");
  if (!admin) {
    const seeded = createSeed();
    const studio = seeded.users.find((user) => user.role === "admin");
    if (studio) store.users.push(studio);
  }
  await writeStore(store);
  const saved = await fetchStore();
  const desk = saved.users.find((user) => user.role === "admin");
  console.log(
    JSON.stringify({
      admin: desk?.email ?? null,
      products: saved.products.length,
      categories: saved.categories.length,
      orders: saved.orders.length,
      customers: saved.users.filter((user) => user.role === "customer").length,
    }),
  );
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
