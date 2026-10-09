import { Suspense } from "react";
import Link from "next/link";
import { CategoryMarks, CategoryPhotos, HeroCards, HeroSkeleton, HomeNotes, HomeShelves } from "@/components/home-catalog";
import { buttonClass } from "@/components/button";

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
        <Suspense fallback={<HeroSkeleton />}>
          <HeroCards />
        </Suspense>
      </section>
      <Suspense fallback={<CategoryMarks />}>
        <CategoryPhotos />
      </Suspense>
      <Suspense fallback={null}>
        <HomeShelves />
      </Suspense>
      <Suspense fallback={null}>
        <HomeNotes />
      </Suspense>
    </div>
  );
}
