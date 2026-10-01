import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { PhotoGridSkeleton } from "@/components/skeleton";
import { buttonClass, controlClass } from "@/components/button";
import { readCatalog } from "@/lib/db";
import { CATEGORIES, categoryLabel } from "@/lib/domain";
import type { Product } from "@/lib/types";

export const metadata: Metadata = { title: "Shop" };

type ShopQuery = { q?: string; category?: string; sort?: string };

function sortProducts(list: Product[], sort: string) {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
  else copy.sort((a, b) => Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name));
  return copy;
}

function ShopChrome({
  title,
  blurb,
  category,
  q,
  sort,
}: {
  title: string;
  blurb: string;
  category: string;
  q: string;
  sort: string;
}) {
  return (
    <>
      <h1 className="hero-rise font-display text-4xl text-cocoa sm:text-5xl">{title}</h1>
      <p className="hero-rise mt-2 max-w-xl text-sm text-muted" style={{ animationDelay: "80ms" }}>{blurb}</p>
      <div className="hero-rise mt-6 flex gap-2 overflow-x-auto pb-1" style={{ animationDelay: "140ms" }}>
        <Link href="/shop" className={`shrink-0 rounded-full px-4 py-2 text-sm ${category ? "bg-white text-bark" : "bg-sage text-white"}`}>All</Link>
        {CATEGORIES.map((item) => (
          <Link
            key={item.id}
            href={`/shop?category=${item.id}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm ${category === item.id ? "bg-sage text-white" : "bg-white text-bark"}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <form action="/shop" className="hero-rise mt-6 grid gap-3 sm:flex sm:flex-wrap" style={{ animationDelay: "200ms" }}>
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
    </>
  );
}

async function ShopHeading({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const params = await searchParams;
  const category = params.category ?? "";
  const current = CATEGORIES.find((item) => item.id === category);
  return (
    <ShopChrome
      title={current?.label ?? "Shop"}
      blurb={current?.blurb ?? "Cardigans, scarves, gloves, keychains, flowers, and card holders. All handmade."}
      category={category}
      q={(params.q ?? "").trim()}
      sort={params.sort ?? "featured"}
    />
  );
}

async function ShopGrid({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const category = params.category ?? "";
  const sort = params.sort ?? "featured";
  const catalog = await readCatalog();
  const categories = catalog.categories.length ? catalog.categories : CATEGORIES.map((item) => ({ ...item, imageUrl: "" }));
  const needle = q.toLowerCase();
  const filtered = sortProducts(
    catalog.products.filter((product) => {
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
    <>
      <p className="mt-6 text-sm text-muted">{filtered.length} {filtered.length === 1 ? "piece" : "pieces"}</p>
      {filtered.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-line bg-white px-6 py-14 text-center">
          <p className="font-display text-3xl text-cocoa">Nothing matches that</p>
          <p className="mt-2 text-sm text-muted">Try another word, or browse the whole shop.</p>
          <Link href="/shop" className={`${buttonClass("solid")} mt-5`}>Clear search</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} eager={index < 4} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ShopPage({ searchParams }: { searchParams: Promise<ShopQuery> }) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Suspense
        fallback={
          <ShopChrome
            title="Shop"
            blurb="Cardigans, scarves, gloves, keychains, flowers, and card holders. All handmade."
            category=""
            q=""
            sort="featured"
          />
        }
      >
        <ShopHeading searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<div className="mt-6"><PhotoGridSkeleton count={8} /></div>}>
        <ShopGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
