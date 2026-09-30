import type { Metadata } from "next";
import { KeepsakesGrid } from "@/components/keepsakes-grid";
import { readStore } from "@/lib/db";

export const metadata: Metadata = { title: "Keepsakes" };

export default async function KeepsakesPage() {
  const store = await readStore();
  const products = store.products.filter((product) => product.active);
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-display text-5xl text-cocoa">Keepsakes</h1>
      <p className="mt-2 mb-8 text-sm text-muted">Pieces you saved on this browser.</p>
      <KeepsakesGrid products={products} />
    </div>
  );
}
