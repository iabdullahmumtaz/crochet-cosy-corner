import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";
import { safeNext } from "@/lib/format";

export const metadata: Metadata = {
  title: "Studio desk",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;
  const from = safeNext(params.from, "/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-5 py-12">
      <div className="panel w-full max-w-md rounded-[28px] p-8 text-ink">
        <p className="font-script text-3xl text-sage">studio desk</p>
        <h1 className="font-display text-4xl text-cocoa">Sign in</h1>
        <p className="mt-2 mb-6 text-sm text-muted">Orders, pieces, and the inbox. Shoppers use a different door.</p>
        <LoginForm mode="admin" from={from} />
        <Link href="/" className="mt-4 inline-block text-sm text-sage-deep underline">Back to the shop</Link>
      </div>
    </div>
  );
}
