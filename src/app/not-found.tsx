import Link from "next/link";
import { buttonClass } from "@/components/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
      <p className="font-script text-3xl text-sage">dropped a stitch</p>
      <h1 className="mt-2 font-display text-5xl text-cocoa">That page is not in the shop</h1>
      <p className="mt-3 text-sm text-muted">The piece may have left the shelf, or the link wandered off.</p>
      <Link href="/shop" className={`${buttonClass("solid")} mt-6`}>Back to the shop</Link>
    </div>
  );
}
