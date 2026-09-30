import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { StatusPill } from "@/components/yarn-tracker";
import { getCurrentUser } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") redirect("/login");
  const store = await readStore();
  const orders = store.orders.filter((order) => order.userId === user.id);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[320px_1fr]">
      <section>
        <p className="font-script text-3xl text-sage">hello</p>
        <h1 className="font-display text-5xl text-cocoa">{user.name.split(" ")[0]}</h1>
        <div className="mt-6 rounded-[28px] border border-line bg-white p-5">
          <ProfileForm user={user} />
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl text-bark">Orders</h2>
          <span className="flex gap-4 text-sm font-semibold text-sage">
            <Link href="/account/addresses">Addresses</Link>
            <Link href="/keepsakes">Keepsakes</Link>
          </span>
        </div>
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-line bg-white px-6 py-12">
            <p className="text-sm text-muted">No orders on this account yet.</p>
            <Link href="/shop" className="mt-3 inline-block text-sm text-sage-deep underline">Start with the shop</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link href={`/account/orders/${order.number}`} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-line bg-white px-5 py-4">
                  <span>
                    <span className="block text-ink">{order.number}</span>
                    <span className="text-sm text-muted">{formatWhen(order.createdAt)} · {order.items.length} {order.items.length === 1 ? "piece" : "pieces"}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <StatusPill status={order.status} />
                    <span className="text-sm">{formatRs(order.total)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
