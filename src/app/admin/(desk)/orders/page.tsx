import Link from "next/link";
import { DeskPager } from "@/components/desk-pager";
import { StatusPill } from "@/components/yarn-tracker";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";
import { pageOf, parsePage } from "@/lib/paging";
import { STATUS_LABEL } from "@/lib/order-flow";
import type { OrderStatus } from "@/lib/types";

const filters = ["all", "open", "placed", "confirmed", "making", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const q = (params.q ?? "").trim().toLowerCase();
  const store = await readStore();
  const orders = store.orders.filter((order) => {
    const matchesStatus = status === "all" || (status === "open" ? order.status !== "delivered" && order.status !== "cancelled" : order.status === status);
    if (!matchesStatus) return false;
    if (!q) return true;
    return [order.number, order.name, order.email, order.city, order.phone].join(" ").toLowerCase().includes(q);
  });
  const { items, ...pager } = pageOf(orders, parsePage(params.page));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-cocoa">Orders</h1>
          <p className="mt-1 text-sm text-muted">{orders.length} in this view. Open an order to move it along.</p>
        </div>
        <form>
          {status !== "all" ? <input type="hidden" name="status" value={status} /> : null}
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search name, email, or CC-number" className="h-12 w-72 max-w-full rounded-full border border-line bg-white px-4 text-sm" />
        </form>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter}
            href={filter === "all" ? (q ? `/admin/orders?q=${encodeURIComponent(q)}` : "/admin/orders") : `/admin/orders?status=${filter}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full px-3 py-1.5 text-xs ${status === filter ? "bg-sage text-white" : "bg-white text-bark ring-1 ring-line"}`}
          >
            {filter === "all" || filter === "open" ? filter : STATUS_LABEL[filter as OrderStatus]}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="stack w-full text-left text-sm md:min-w-[720px]">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.number}`} className="text-ink hover:underline">{order.number}</Link>
                  <span className="block text-xs text-muted">{formatWhen(order.createdAt)}</span>
                </td>
                <td data-label="Customer" className="px-4 py-3">
                  {order.userId ? <Link href={`/admin/customers/${order.userId}`} className="hover:underline">{order.name}</Link> : order.name}
                  <span className="block text-xs text-muted">{order.email}</span>
                </td>
                <td data-label="City" className="px-4 py-3 text-muted">{order.city}</td>
                <td data-label="Total" className="px-4 py-3">{formatRs(order.total)}</td>
                <td data-label="Status" className="px-4 py-3"><StatusPill status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No orders in this view.</p> : null}
        <DeskPager
          {...pager}
          pathname="/admin/orders"
          params={{ status: status === "all" ? undefined : status, q: params.q }}
        />
      </div>
    </div>
  );
}
