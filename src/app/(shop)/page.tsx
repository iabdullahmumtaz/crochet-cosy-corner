import { Suspense } from "react";
import Link from "next/link";
import { CategoryMarks, CategoryPhotos, CategoryRail, HeroArt, HeroCards, HomeNotes, RailSkeleton } from "@/components/home-catalog";
import { buttonClass } from "@/components/button";
import { CATEGORIES } from "@/lib/domain";

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div>
          <p className="hero-rise text-[11px] font-medium tracking-[0.28em] text-brass uppercase">Small-batch crochet</p>
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-medium text-ink sm:text-6xl">
            <span className="hero-rise block" style={{ animationDelay: "90ms" }}>Soft things,</span>
            <span className="hero-rise mt-1 block font-script text-sage" style={{ animationDelay: "180ms" }}>made after you ask.</span>
          </h1>
          <p className="hero-rise mt-6 max-w-md text-base leading-7 text-muted" style={{ animationDelay: "280ms" }}>
            Amigurumi, scarves, flower stems, and shoulder bags. Most pieces start once the order is in, so the yarn can follow your note.
          </p>
          <div className="hero-rise mt-8 flex flex-wrap gap-3" style={{ animationDelay: "380ms" }}>
            <Link href="/shop" className={buttonClass("solid")}>Shop the collection</Link>
            <Link href="/faq" className={buttonClass("ghost")}>How an order moves</Link>
          </div>
        </div>
        <Suspense fallback={<HeroArt />}>
          <HeroCards />
        </Suspense>
      </section>
      <Suspense fallback={<CategoryMarks />}>
        <CategoryPhotos />
      </Suspense>
      {CATEGORIES.map((category, index) => (
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
          <Suspense fallback={<RailSkeleton />}>
            <CategoryRail id={category.id} />
          </Suspense>
        </section>
      ))}
      <Suspense fallback={null}>
        <HomeNotes />
      </Suspense>
    </div>
  );
}
