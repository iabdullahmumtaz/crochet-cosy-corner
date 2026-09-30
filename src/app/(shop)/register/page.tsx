import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user?.role === "customer") redirect("/account");

  return (
    <div className="mx-auto grid max-w-md px-5 py-14">
      <h1 className="font-display text-5xl text-cocoa">Create account</h1>
      <p className="mt-2 mb-6 text-sm text-muted">A shopper account. We email a confirmation link before you can sign in. The studio desk is a separate sign-in.</p>
      <div className="rounded-[28px] border border-line bg-white p-6">
        <RegisterForm />
        <p className="mt-4 text-sm text-muted">
          Already shopping with us? <Link href="/login" className="text-sage-deep underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
