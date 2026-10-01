import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { buttonClass, controlClass } from "@/components/button";
import { categoryLabel } from "@/lib/domain";
import { readStore } from "@/lib/db";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Shop" };

function sortProducts(list: Product[], sort: string) {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else copy.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  return copy;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = params.category ?? "";
  const sort = params.sort ?? "featured";
  const store = await readStore();
  const categories = store.categories ?? [];
  const needle = q.toLowerCase();
  const filtered = sortProducts(
    store.products.filter((product) => {
      if (!product.active) return false;
      if (category && product.category !== category) return false;
      if (!needle) return true;
      return [product.name, product.description, product.yarn, categoryLabel(product.category, categories)]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    }),
    sort,
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-4xl text-cocoa sm:text-5xl">{category ? categoryLabel(category, categories) : "Shop"}</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        {category
          ? categories.find((item) => item.id === category)?.blurb
          : "Cardigans, scarves, gloves, keychains, flowers, and card holders. All handmade."}
      </p>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        <Link href="/shop" className={`shrink-0 rounded-full px-4 py-2 text-sm ${category ? "bg-white text-bark" : "bg-sage text-white"}`}>All</Link>
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/shop?category=${item.id}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === item.id ? "bg-sage text-white" : "bg-white text-bark"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <form action="/shop" className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <input name="q" defaultValue={q} placeholder="Search pieces" aria-label="Search pieces" className={`${controlClass} sm:max-w-sm`} />
        <select name="sort" defaultValue={sort} aria-label="Sort" className={`${controlClass} sm:max-w-[220px]`}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price, low to high</option>
          <option value="price-desc">Price, high to low</option>
          <option value="name">Name</option>
        </select>
        <button className={buttonClass("ghost", "w-full sm:w-auto")}>Search</button>
      </form>
      <p className="mt-6 text-sm text-muted">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="font-display text-3xl text-cocoa">Nothing matches that</p>
          <p className="mt-2 text-sm text-muted">Try another word, or browse the whole shop.</p>
          <Link href="/shop" className={`${buttonClass("solid")} mt-5`}>Clear search</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
