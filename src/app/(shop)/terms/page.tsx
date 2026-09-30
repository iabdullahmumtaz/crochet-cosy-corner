import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl font-semibold text-ink">Terms</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>Prices are in Pakistani rupees and are confirmed on the server when you place the order. Stock shown on a card can change before checkout finishes.</p>
        <p>An order is a request to make the piece. The studio can cancel if yarn is unavailable, and will say so on the tracker.</p>
        <p>Photos are colour studies of the stitch. A handmade piece can sit a little differently from the picture.</p>
      </div>
    </div>
  );
}
