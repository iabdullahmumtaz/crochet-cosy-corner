import Link from "next/link";
import { ProductArt } from "@/components/product-art";
import { ProductCard } from "@/components/product-card";
import { buttonClass } from "@/components/button";
import { readStore } from "@/lib/db";

export default async function HomePage() {
  const store = await readStore();
  const products = store.products.filter((product) => product.active);
  const featured = [...products].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4);
  const categories = store.categories ?? [];

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div>
          <p className="text-[11px] font-medium tracking-[0.28em] text-brass uppercase">Small-batch crochet</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-medium text-ink sm:text-6xl">
            Soft things,
            <span className="mt-1 block font-script text-sage">made after you ask.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            Amigurumi, scarves, flower stems, and shoulder bags. Most pieces start once the order is in, so the yarn can follow your note.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className={buttonClass("solid")}>Shop the collection</Link>
            <Link href="/faq" className={buttonClass("ghost")}>How an order moves</Link>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {categories.slice(0, 4).map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="panel lift overflow-hidden rounded-3xl"
            >
              {category.imageUrl ? (
                <img src={category.imageUrl} alt="" className="aspect-[4/5] w-full object-cover" />
              ) : (
                <ProductArt motif={category.motif} palette={category.palette} className="aspect-[4/5]" />
              )}
              <p className="px-4 py-3 text-center font-display text-xl text-ink">{category.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4 text-[12px] tracking-[0.16em] text-muted uppercase">
          <span>Made to order</span>
          <span>Karachi studio</span>
          <span>Free delivery over Rs3,000</span>
          <span>HUG10 at checkout</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-brass uppercase">Selected</p>
            <h2 className="mt-2 font-display text-4xl font-medium text-ink sm:text-5xl">On the table</h2>
          </div>
          <Link href="/shop" className="text-sm text-sage underline decoration-petal underline-offset-4">All pieces</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/shop?category=${category.id}`} className="panel lift rounded-3xl px-5 py-5">
            <p className="font-display text-3xl text-ink">{category.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{category.blurb}</p>
          </Link>
        ))}
      </section>

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
    </div>
  );
}
