import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AddressBook } from "@/components/address-book";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") redirect("/login");
  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/account" className="text-sm font-semibold text-sage">Back to account</Link>
      <h1 className="mt-3 font-display text-5xl font-semibold text-ink">Addresses</h1>
      <div className="mt-6">
        <AddressBook addresses={user.addresses} />
      </div>
    </div>
  );
}
