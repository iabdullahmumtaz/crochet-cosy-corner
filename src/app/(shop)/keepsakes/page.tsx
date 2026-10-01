import { Suspense } from "react";
import type { Metadata } from "next";
import { KeepsakesGrid } from "@/components/keepsakes-grid";
import { PhotoGridSkeleton } from "@/components/skeleton";
import { readCatalog } from "@/lib/db";

export const metadata: Metadata = { title: "Keepsakes" };

async function KeepsakePieces() {
  const catalog = await readCatalog();
  const products = catalog.products.filter((product) => product.active);
  return <KeepsakesGrid products={products} />;
}

export default function KeepsakesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="hero-rise font-display text-5xl text-cocoa">Keepsakes</h1>
      <p className="hero-rise mt-2 mb-8 text-sm text-muted" style={{ animationDelay: "80ms" }}>Pieces you saved on this browser.</p>
      <Suspense fallback={<PhotoGridSkeleton count={4} />}>
        <KeepsakePieces />
      </Suspense>
    </div>
  );
}
