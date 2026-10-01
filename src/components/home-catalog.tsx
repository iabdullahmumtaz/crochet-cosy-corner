import Link from "next/link";
import { CardPhoto } from "@/components/card-photo";
import { ProductArt } from "@/components/product-art";
import { ProductRail } from "@/components/product-rail";
import { readStore } from "@/lib/db";
import type { Product, ShopCategory } from "@/lib/types";

function inCategory(products: Product[], category: ShopCategory) {
  return products.filter((product) => product.category === category.id);
}

export async function HeroCards() {
  const store = await readStore();
  const hero = (store.categories ?? []).slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4">
      {hero.map((category, index) => (
        <Link key={category.id} href={`/shop?category=${category.id}`} className="panel lift overflow-hidden rounded-3xl">
          {category.imageUrl ? (
            <CardPhoto src={category.imageUrl} eager={index < 2} className="aspect-[4/5] w-full" />
          ) : (
            <ProductArt motif={category.motif} palette={category.palette} className="aspect-[4/5]" />
          )}
          <p className="px-4 py-3 text-center font-display text-xl text-ink">{category.label}</p>
        </Link>
      ))}
    </div>
  );
}

export function HeroCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4" aria-hidden>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-3xl border border-line bg-white">
          <div className="bone aspect-[4/5] w-full" />
          <div className="bone mx-auto my-3 h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

export async function HomeCatalog() {
  const store = await readStore();
  const products = store.products.filter((product) => product.active && product.imageUrl);
  const categories = store.categories ?? [];

  return (
    <>
      <section className="border-y border-line bg-white">
        <div className="rail center-row mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 py-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/shop?category=${category.id}`} className="group w-24 shrink-0 text-center sm:w-28">
              <span className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-line bg-foam transition duration-300 group-hover:-translate-y-1 sm:h-24 sm:w-24">
                {category.imageUrl ? <CardPhoto src={category.imageUrl} className="h-full w-full" /> : null}
              </span>
              <span className="mt-2 block text-sm text-ink">{category.label}</span>
            </Link>
          ))}
        </div>
      </section>
      {categories.map((category) => {
        const pieces = inCategory(products, category);
        if (!pieces.length) return null;
        return (
          <section key={category.id} className="mx-auto max-w-6xl px-5 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-medium text-ink sm:text-4xl">{category.label}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted">{category.blurb}</p>
              </div>
              <Link href={`/shop?category=${category.id}`} className="shrink-0 text-sm text-sage underline decoration-petal underline-offset-4">
                View all
              </Link>
            </div>
            <ProductRail products={pieces} />
          </section>
        );
      })}
      {store.reviews.length > 0 ? (
        <section className="mx-auto max-w-6xl px-5 py-16">
          <p className="text-[11px] tracking-[0.22em] text-brass uppercase">From the people who kept them</p>
          <h2 className="mt-2 font-display text-4xl font-medium text-ink sm:text-5xl">Notes</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {store.reviews.map((review) => (
              <figure key={review.id} className="panel rounded-3xl p-6">
                <p className="font-display text-xl leading-8 text-ink">{review.text}</p>
                <figcaption className="mt-4 text-sm text-muted">
                  <span className="text-brass">{"★".repeat(review.rating)}</span> {review.name} · {review.city}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
