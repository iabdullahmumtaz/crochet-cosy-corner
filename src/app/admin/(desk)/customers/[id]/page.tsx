import Link from "next/link";
import { notFound } from "next/navigation";
import { CustomerEditor } from "@/components/customer-editor";
import { StatusPill } from "@/components/yarn-tracker";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const user = store.users.find((item) => item.id === id && item.role === "customer");
  if (!user) notFound();
  const orders = store.orders.filter((order) => order.userId === user.id || order.email === user.email);
  const taken = orders.filter((order) => order.status !== "cancelled");
  const spent = taken.reduce((sum, order) => sum + order.total, 0);
  const open = taken.filter((order) => order.status !== "delivered").length;

  return (
    <div>
      <Link href="/admin/customers" className="text-sm text-sage-deep">Back to customers</Link>
      <h1 className="mt-2 font-display text-4xl text-cocoa">{user.name}</h1>
      <p className="mt-2 text-sm text-muted">{taken.length} orders · {formatRs(spent)} taken · {open} still open</p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-muted">Email</dt><dd>{user.email}</dd></div>
        <div><dt className="text-muted">Phone</dt><dd>{user.phone || "—"}</dd></div>
        <div><dt className="text-muted">City</dt><dd>{user.city || "—"}</dd></div>
        <div><dt className="text-muted">Joined</dt><dd>{formatWhen(user.createdAt)}</dd></div>
      </dl>
      <CustomerEditor id={user.id} name={user.name} phone={user.phone} city={user.city} />
      <h2 className="mt-8 font-display text-2xl text-cocoa">Addresses</h2>
      <ul className="mt-3 space-y-2">
        {(user.addresses ?? []).length === 0 ? <li className="text-sm text-muted">No saved addresses.</li> : null}
        {(user.addresses ?? []).map((address) => (
          <li key={address.id} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
            <span className="font-medium">{address.label}</span>
            <span className="mt-1 block text-muted">{address.line} · {address.city} · {address.phone}</span>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-display text-2xl text-cocoa">Orders</h2>
      <ul className="mt-3 space-y-2">
        {orders.length === 0 ? <li className="text-sm text-muted">No orders on this email yet.</li> : null}
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/admin/orders/${order.number}`} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-sm">
              <span>{order.number} · {formatWhen(order.createdAt)}</span>
              <span className="flex items-center gap-3">
                <StatusPill status={order.status} />
                <span>{formatRs(order.total)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}