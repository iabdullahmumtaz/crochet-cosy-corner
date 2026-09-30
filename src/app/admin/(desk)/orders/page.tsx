import Link from "next/link";
import { StatusPill } from "@/components/yarn-tracker";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";
import { STATUS_LABEL } from "@/lib/order-flow";
import type { OrderStatus } from "@/lib/types";

const filters = ["all", "open", "placed", "confirmed", "making", "packed", "shipped", "out_for_delivery", "delivered", "cancelled"] as const;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "all";
  const store = await readStore();
  const orders = store.orders.filter((order) => {
    if (status === "all") return true;
    if (status === "open") return order.status !== "delivered" && order.status !== "cancelled";
    return order.status === status;
  });

  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter}
            href={filter === "all" ? "/admin/orders" : `/admin/orders?status=${filter}`}
            className={`rounded-full px-3 py-1.5 text-xs ${status === filter ? "bg-sage text-white" : "bg-white text-bark ring-1 ring-line"}`}
          >
            {filter === "all" || filter === "open" ? filter : STATUS_LABEL[filter as OrderStatus]}
          </Link>
        ))}
      </div>
      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
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
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.number}`} className="text-ink hover:underline">{order.number}</Link>
                  <span className="block text-xs text-muted">{formatWhen(order.createdAt)}</span>
                </td>
                <td className="px-4 py-3">{order.name}</td>
                <td className="px-4 py-3 text-muted">{order.city}</td>
                <td className="px-4 py-3">{formatRs(order.total)}</td>
                <td className="px-4 py-3"><StatusPill status={order.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No orders in this view.</p> : null}
      </div>
    </div>
  );
}
