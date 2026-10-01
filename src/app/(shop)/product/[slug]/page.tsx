import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/add-to-cart";
import { CardPhoto } from "@/components/card-photo";
import { ProductArt } from "@/components/product-art";
import { ProductCard } from "@/components/product-card";
import { RecentPieces, RememberPiece } from "@/components/recent-pieces";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { categoryLabel } from "@/lib/domain";
import { buyerReceived, readCatalog } from "@/lib/db";
import { formatRs, percentOff } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.slug === slug && item.active);
  return { title: product?.name ?? "Piece" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.slug === slug && item.active);
  if (!product) notFound();
  const off = percentOff(product.price, product.compareAt);
  const related = catalog.products.filter((item) => item.active && item.category === product.category && item.id !== product.id).slice(0, 4);
  const reviews = catalog.reviews.filter((review) => review.productId === product.id);
  const user = await getCurrentUser();
  const canReview = Boolean(
    user?.role === "customer" &&
      !reviews.some((review) => review.userId === user.id) &&
      (await buyerReceived(user.id, product.id)),
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <RememberPiece slug={product.slug} name={product.name} />
      <p className="text-sm text-muted">
        <Link href="/shop" className="hover:text-sage-deep">Shop</Link>
        <span> / </span>
        <Link href={`/shop?category=${product.category}`} className="hover:text-sage-deep">{categoryLabel(product.category, catalog.categories)}</Link>
      </p>
      <div className="mt-6 grid items-start gap-10 lg:grid-cols-2">
        <div className="panel overflow-hidden rounded-[28px]">
          {product.imageUrl ? (
            <CardPhoto src={product.imageUrl} eager className="aspect-[4/5] w-full" />
          ) : (
            <ProductArt motif={product.motif} palette={product.palette} />
          )}
        </div>
        <div>
          <h1 className="font-display text-5xl text-cocoa">{product.name}</h1>
          <p className="mt-4 text-lg">
            <span>{formatRs(product.price)}</span>
            {product.compareAt && off ? (
              <>
                <span className="ml-3 text-base text-muted line-through">{formatRs(product.compareAt)}</span>
                <span className="ml-3 text-base text-sale">({off}% OFF)</span>
              </>
            ) : null}
          </p>
          <p className="mt-5 max-w-lg leading-7 text-muted">{product.description}</p>
          <dl className="mt-6 grid gap-2 text-sm">
            <div className="flex gap-3"><dt className="w-24 text-muted">Yarn</dt><dd>{product.yarn}</dd></div>
            <div className="flex gap-3"><dt className="w-24 text-muted">Collection</dt><dd>{categoryLabel(product.category, catalog.categories)}</dd></div>
            <div className="flex gap-3">
              <dt className="w-24 text-muted">Shelf</dt>
              <dd>{product.stock === 0 ? "Sold out" : product.stock <= 3 ? `Only ${product.stock} left` : `${product.stock} ready to make`}</dd>
            </div>
          </dl>
          <AddToCart product={product} />
          <p className="mt-6 max-w-md text-sm leading-6 text-muted">
            Spot clean. Handmade, so a stitch may sit a little differently from the picture. Most pieces leave the studio in 2–5 days.
          </p>
        </div>
      </div>
      <section className="mt-14">
        <h2 className="font-display text-3xl text-bark">Notes on this piece</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No notes on this piece yet.</p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <figure key={review.id} className="rounded-3xl border border-line bg-white p-5">
                <p className="text-sm leading-6">{review.text}</p>
                <figcaption className="mt-3 text-sm text-muted">{review.name} · {review.city}</figcaption>
              </figure>
            ))}
          </div>
        )}
        {canReview ? <ReviewForm productId={product.id} /> : null}
      </section>
      <RecentPieces current={product.slug} />
      {related.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-3xl text-bark">More in {categoryLabel(product.category, catalog.categories)}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
