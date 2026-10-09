import Link from "next/link";
import { CardPhoto } from "@/components/card-photo";
import { ProductArt } from "@/components/product-art";
import { ProductRail } from "@/components/product-rail";
import { readCatalog } from "@/lib/db";
import { CATEGORIES } from "@/lib/domain";
import type { ShopCategory } from "@/lib/types";

function marks(categories: ShopCategory[]) {
  return (
    <div className="rail center-row mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 py-6">
      {categories.map((category, index) => (
        <Link key={category.id} href={`/shop?category=${category.id}`} className="card-rise group w-24 shrink-0 text-center sm:w-28" style={{ animationDelay: `${index * 50}ms` }}>
          <span className="mx-auto grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-line bg-foam transition duration-300 group-hover:-translate-y-1 sm:h-24 sm:w-24">
            {category.imageUrl ? (
              <CardPhoto src={category.imageUrl} eager className="h-full w-full" />
            ) : (
              <ProductArt motif={category.motif} palette={category.palette} className="h-full w-full" />
            )}
          </span>
          <span className="mt-2 block text-sm text-ink">{category.label}</span>
        </Link>
      ))}
    </div>
  );
}

export function CategoryMarks() {
  return (
    <section className="border-y border-line bg-white" aria-hidden>
      <div className="rail center-row mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 py-6">
        {CATEGORIES.map((category) => (
          <div key={category.id} className="w-24 shrink-0 text-center sm:w-28">
            <span className="bone mx-auto block h-20 w-20 rounded-full sm:h-24 sm:w-24" />
            <span className="mt-2 block text-sm text-ink">{category.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function CategoryPhotos() {
  const catalog = await readCatalog();
  return <section className="border-y border-line bg-white">{marks(catalog.categories.length ? catalog.categories : CATEGORIES.map((category) => ({ ...category, imageUrl: "" })))}</section>;
}

export function HeroSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4" aria-hidden>
      {CATEGORIES.slice(0, 4).map((category) => (
        <div key={category.id} className="overflow-hidden rounded-3xl border border-line bg-white">
          <div className="bone aspect-[4/5] w-full" />
          <p className="px-4 py-3 text-center font-display text-xl text-ink">{category.label}</p>
        </div>
      ))}
    </div>
  );
}

export async function HeroCards() {
  const catalog = await readCatalog();
  const hero = (catalog.categories.length ? catalog.categories : CATEGORIES.map((category) => ({ ...category, imageUrl: "" }))).slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4">
      {hero.map((category, index) => (
        <Link key={category.id} href={`/shop?category=${category.id}`} className="panel lift card-rise overflow-hidden rounded-3xl" style={{ animationDelay: `${index * 70}ms` }}>
          {category.imageUrl ? (
            <CardPhoto src={category.imageUrl} eager className="aspect-[4/5] w-full" />
          ) : (
            <ProductArt motif={category.motif} palette={category.palette} className="aspect-[4/5]" />
          )}
          <p className="px-4 py-3 text-center font-display text-xl text-ink">{category.label}</p>
        </Link>
      ))}
    </div>
  );
}

export async function HomeShelves() {
  const catalog = await readCatalog();
  return (
    <>
      {catalog.categories.map((category, index) => {
        const pieces = catalog.products.filter((product) => product.active && product.category === category.id);
        return (
          <section key={category.id} className="mx-auto max-w-6xl px-5 py-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="hero-rise font-display text-3xl font-medium text-ink sm:text-4xl" style={{ animationDelay: `${80 + index * 30}ms` }}>{category.label}</h2>
                <p className="hero-rise mt-2 max-w-xl text-sm leading-6 text-muted" style={{ animationDelay: `${140 + index * 30}ms` }}>{category.blurb}</p>
              </div>
              <Link href={`/shop?category=${category.id}`} className="shrink-0 text-sm text-sage underline decoration-petal underline-offset-4">
                View all
              </Link>
            </div>
            {pieces.length ? <ProductRail products={pieces} /> : null}
          </section>
        );
      })}
    </>
  );
}

export async function HomeNotes() {
  const catalog = await readCatalog();
  if (!catalog.reviews.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <p className="hero-rise text-[11px] tracking-[0.22em] text-brass uppercase">From the people who kept them</p>
      <h2 className="hero-rise mt-2 font-display text-4xl font-medium text-ink sm:text-5xl" style={{ animationDelay: "80ms" }}>Notes</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {catalog.reviews.map((review) => (
          <figure key={review.id} className="panel rounded-3xl p-6">
            <p className="font-display text-xl leading-8 text-ink">{review.text}</p>
            <figcaption className="mt-4 text-sm text-muted">
              <span className="text-brass">{"★".repeat(review.rating)}</span> {review.name} · {review.city}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
