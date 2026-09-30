import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { safeNext } from "@/lib/format";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const user = await getCurrentUser();
  if (user?.role === "customer") redirect("/account");
  const params = await searchParams;
  const from = safeNext(params.from, "/account");

  return (
    <div className="mx-auto grid max-w-md px-5 py-14">
      <h1 className="font-display text-5xl text-cocoa">Sign in</h1>
      <p className="mt-2 mb-6 text-sm text-muted">Your orders, keepsakes, and delivery details live here.</p>
      <div className="rounded-[28px] border border-line bg-white p-6">
        <LoginForm mode="customer" from={from} />
        <p className="mt-4 text-sm text-muted">
          New here? <Link href="/register" className="text-sage-deep underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
