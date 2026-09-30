"use client";

import { buttonClass } from "@/components/button";

export default function ShopError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-5 py-20 text-center">
      <h1 className="font-display text-4xl text-cocoa">This page snagged</h1>
      <p className="mt-3 text-sm text-muted">Try it once more. If it keeps snagging, come back in a moment.</p>
      <button className={`${buttonClass("solid")} mt-6`} onClick={() => reset()}>Try again</button>
    </div>
  );
}
