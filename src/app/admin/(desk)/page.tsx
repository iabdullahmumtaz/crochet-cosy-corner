import Link from "next/link";
import { StatusPill } from "@/components/yarn-tracker";
import { requireRole } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/order-flow";
import { redirect } from "next/navigation";

export default async function DeskPage() {
  const user = await requireRole("admin");
  if (!user) redirect("/admin/login");
  const store = await readStore();
  const openOrders = store.orders.filter((order) => order.status !== "delivered" && order.status !== "cancelled");
  const revenue = store.orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const low = store.products.filter((product) => product.active && product.stock <= 3);
  const counts = ["placed", "confirmed", "making", "packed", "shipped", "out_for_delivery"] as const;

  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Desk</h1>
      <p className="mt-1 text-sm text-muted">Open orders, low yarn, and what came in today.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-5">
          <p className="text-sm text-muted">Open orders</p>
          <p className="font-display text-4xl text-cocoa">{openOrders.length}</p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-5">
          <p className="text-sm text-muted">Taken, not cancelled</p>
          <p className="font-display text-4xl text-cocoa">{formatRs(revenue)}</p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-5">
          <p className="text-sm text-muted">Low on the shelf</p>
          <p className="font-display text-4xl text-cocoa">{low.length}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {counts.map((status) => (
          <Link key={status} href={`/admin/orders?status=${status}`} className="rounded-full bg-white px-3 py-1.5 text-xs text-bark ring-1 ring-line">
            {STATUS_LABEL[status]} · {store.orders.filter((order) => order.status === status).length}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-line bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cocoa">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm text-sage-deep">All orders</Link>
          </div>
          <ul className="space-y-3">
            {store.orders.slice(0, 5).map((order) => (
              <li key={order.id}>
                <Link href={`/admin/orders/${order.number}`} className="flex items-center justify-between gap-3 text-sm">
                  <span>
                    <span className="block text-ink">{order.number}</span>
                    <span className="text-muted">{order.name} · {formatWhen(order.createdAt)}</span>
                  </span>
                  <StatusPill status={order.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[28px] border border-line bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl text-cocoa">Running low</h2>
            <Link href="/admin/products" className="text-sm text-sage-deep">Pieces</Link>
          </div>
          {low.length === 0 ? (
            <p className="text-sm text-muted">Every active piece has more than 3 left.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {low.map((product) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <Link href={`/admin/products/${product.id}`} className="hover:underline">{product.name}</Link>
                  <span className="text-sale">{product.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
