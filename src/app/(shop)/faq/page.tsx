import type { Metadata } from "next";

export const metadata: Metadata = { title: "Questions" };

const items = [
  ["When does a piece start?", "Most wearables, amigurumi, and bouquets are hooked after the order is confirmed. Ready stock is marked on the piece."],
  ["How long does making take?", "Usually 2–5 days at the hook, then packing. Courier time depends on the city."],
  ["What yarn is used?", "Milk cotton, wool blends, and cotton cord. Each piece names its yarn."],
  ["Can I ask for initials?", "Yes. Leave them in the studio note at checkout. Phone covers and clips are the usual place."],
  ["When is delivery free?", "Orders over Rs5,000 ship free. Smaller orders are Rs180 in Lahore and Rs280 to the other cities we list."],
  ["How do I track?", "Use the order number and the checkout email on the track page. Signed-in orders also live in your account."],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl font-semibold text-ink">Questions</h1>
      <div className="mt-8 space-y-3">
        {items.map(([title, body]) => (
          <details key={title} className="rounded-3xl border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white px-5 py-4">
            <summary className="cursor-pointer font-semibold">{title}</summary>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
