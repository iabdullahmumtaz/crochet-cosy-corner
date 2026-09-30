import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrderPanel } from "@/components/order-panel";
import { getCurrentUser } from "@/lib/auth";
import { readStore } from "@/lib/db";

export const metadata: Metadata = { title: "Your order" };

export default async function AccountOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") redirect("/login");
  const { number } = await params;
  const store = await readStore();
  const order = store.orders.find((item) => item.number === number && item.userId === user.id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <Link href="/account" className="text-sm text-sage-deep">Back to your account</Link>
      <h1 className="mt-3 mb-8 font-display text-5xl text-cocoa">Your order</h1>
      <OrderPanel order={order} />
    </div>
  );
}
