import type { Metadata } from "next";
import { OfferForm } from "@/components/offer-form";
import { readStore } from "@/lib/db";

export const metadata: Metadata = { title: "Offers" };

export default async function OffersPage() {
  const store = await readStore();
  return (
    <div>
      <h1 className="font-display text-4xl font-semibold text-ink">Offers</h1>
      <p className="mt-2 mb-6 text-sm text-muted">Codes apply at checkout. Percent offers stop at 80.</p>
      <OfferForm coupons={store.coupons ?? []} />
    </div>
  );
}
