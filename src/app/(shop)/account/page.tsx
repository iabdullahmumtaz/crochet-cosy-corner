import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { KeepCount } from "@/components/keep-count";
import { ProfileForm } from "@/components/profile-form";
import { StatusPill } from "@/components/yarn-tracker";
import { getCurrentUser } from "@/lib/auth";
import { readOrdersForUser } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "customer") redirect("/login");
  const orders = await readOrdersForUser(user.id);

  const first = user.name.trim().slice(0, 1).toUpperCase() || "C";

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-[28px] border border-line bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-foam font-display text-3xl text-cocoa">{first}</div>
            <div className="min-w-0">
              <p className="font-script text-2xl text-sage">your profile</p>
              <h1 className="truncate font-display text-3xl text-cocoa">{user.name}</h1>
              <p className="truncate text-sm text-muted">{user.email}</p>
            </div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-sand px-3 py-3">
              <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Orders</dt>
              <dd className="mt-1 font-display text-2xl text-cocoa">{orders.length}</dd>
            </div>
            <div className="rounded-2xl bg-sand px-3 py-3">
              <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Keepsakes</dt>
              <dd className="mt-1 font-display text-2xl text-cocoa"><KeepCount /></dd>
            </div>
            <div className="rounded-2xl bg-sand px-3 py-3">
              <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">City</dt>
              <dd className="mt-1 text-ink">{user.city || "Not set"}</dd>
            </div>
            <div className="rounded-2xl bg-sand px-3 py-3">
              <dt className="text-[11px] tracking-[0.14em] text-muted uppercase">Since</dt>
              <dd className="mt-1 text-ink">{formatWhen(user.createdAt)}</dd>
            </div>
          </dl>
        </section>
        <nav className="flex flex-wrap gap-2 text-sm">
          <Link href="/account/addresses" className="rounded-full border border-line bg-white px-4 py-2 text-bark hover:text-ink">Addresses</Link>
          <Link href="/keepsakes" className="rounded-full border border-line bg-white px-4 py-2 text-bark hover:text-ink">Keepsakes</Link>
          <Link href="/track" className="rounded-full border border-line bg-white px-4 py-2 text-bark hover:text-ink">Track</Link>
        </nav>
      </aside>
      <div className="space-y-10">
      <section>
        <h2 className="font-display text-3xl text-cocoa">Details</h2>
        <div className="mt-4 rounded-[28px] border border-line bg-white p-5">
          <ProfileForm user={user} />
        </div>
      </section>
      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-3xl text-cocoa">Orders</h2>
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
    </div>
  );
}
