import type { Metadata } from "next";
import { TrackForm } from "@/components/track-form";

export const metadata: Metadata = { title: "Track an order" };

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ number?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="font-display text-5xl text-cocoa">Track an order</h1>
      <p className="mt-2 mb-8 text-sm text-muted">
        Use the order number and the email from checkout. The chain updates as the piece is made, packed, and sent.
      </p>
      <TrackForm initialNumber={params.number ?? ""} />
    </div>
  );
}
