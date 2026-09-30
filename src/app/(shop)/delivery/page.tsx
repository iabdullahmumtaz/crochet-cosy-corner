import type { Metadata } from "next";

export const metadata: Metadata = { title: "Delivery and returns" };

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl font-semibold text-ink">Delivery and returns</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>Karachi delivery is Rs180. Other listed cities are Rs280. Orders over Rs3,000 ship free, and FREESHIP waives the fee on smaller baskets.</p>
        <p>Cash on delivery, JazzCash, and EasyPaisa are accepted. Card numbers are never collected here. Wallet payments need a reference so the studio can match the transfer.</p>
        <p>Because pieces are handmade to order, returns are for damage in transit or a clear making mistake. Write within 3 days of delivery with photos. Custom initials are not exchanged.</p>
        <p>Spot clean only. Keep amigurumi and flowers out of the wash.</p>
      </div>
    </div>
  );
}
