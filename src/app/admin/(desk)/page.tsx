import Link from "next/link";
import { StatusPill } from "@/components/yarn-tracker";
import { requireRole } from "@/lib/auth";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/order-flow";
import { redirect } from "next/navigation";

export default async function DeskPage() {
  const user = await requireRole("admin");
  if (!user) redirect("/admin/login");
  const store = await readStore();
  const liveOrders = store.orders.filter((order) => order.status !== "cancelled");
  const openOrders = liveOrders.filter((order) => order.status !== "delivered");
  const revenue = liveOrders.reduce((sum, order) => sum + order.total, 0);
  const average = liveOrders.length ? Math.round(revenue / liveOrders.length) : 0;
  const livePieces = store.products.filter((product) => product.active);
  const shelf = livePieces.reduce((sum, product) => sum + product.price * product.stock, 0);
  const low = livePieces.filter((product) => product.stock <= 3);
  const hidden = store.products.filter((product) => !product.active).length;
  const unread = store.messages.filter((message) => !message.read).length;
  const customers = store.users.filter((user) => user.role === "customer").length;

  const collections = (store.categories ?? []).map((category) => {
    const pieces = livePieces.filter((product) => product.category === category.id);
    const value = pieces.reduce((sum, product) => sum + product.price * product.stock, 0);
    const sold = liveOrders.reduce((sum, order) => {
      return sum + order.items.reduce((line, item) => {
        const product = store.products.find((piece) => piece.id === item.productId);
        return product?.category === category.id ? line + item.lineTotal : line;
      }, 0);
    }, 0);
    return { id: category.id, label: category.label, pieces: pieces.length, value, sold };
  });
  const widest = Math.max(1, ...collections.map((item) => Math.max(item.value, item.sold)));

  const stats = [
    { label: "Open orders", value: String(openOrders.length), href: "/admin/orders?status=open" },
    { label: "Taken", value: formatRs(revenue), href: "/admin/orders" },
    { label: "Average order", value: formatRs(average), href: "/admin/orders" },
    { label: "On the shelf", value: formatRs(shelf), href: "/admin/products" },
    { label: "Low stock", value: String(low.length), href: "/admin/products" },
    { label: "Notes waiting", value: String(unread), href: "/admin/inbox" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-cocoa">Desk</h1>
          <p className="mt-1 text-sm text-muted">
            {livePieces.length} live pieces · {customers} shoppers · {hidden} hidden
          </p>
        </div>
        <p className="text-sm text-muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="rounded-3xl border border-line bg-white p-5 hover:bg-foam">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-1 font-display text-3xl text-cocoa">{stat.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-6 rounded-[28px] border border-line bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-cocoa">Work board</h2>
          <Link href="/admin/orders" className="text-sm text-sage-deep">All orders</Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {STATUS_FLOW.map((status) => {
            const count = store.orders.filter((order) => order.status === status).length;
            return (
              <Link key={status} href={`/admin/orders?status=${status}`} className="rounded-2xl bg-sand px-3 py-3 hover:bg-foam">
                <p className="text-[11px] leading-tight text-muted">{STATUS_LABEL[status]}</p>
                <p className="mt-1 font-display text-2xl text-cocoa">{count}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-[28px] border border-line bg-white p-5">
          <h2 className="font-display text-2xl text-cocoa">Collections</h2>
          <p className="mt-1 text-sm text-muted">Shelf value is price times pieces still ready to make. Sold is what has already been taken.</p>
          <ul className="mt-5 space-y-4">
            {collections.map((item) => (
              <li key={item.id}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <Link href={`/admin/products?category=${item.id}`} className="text-ink hover:underline">{item.label}</Link>
                  <span className="text-muted">{item.pieces} · {formatRs(item.value)}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-foam">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${Math.max(4, (item.value / widest) * 100)}%` }} />
                </div>
                {item.sold > 0 ? <p className="mt-1 text-xs text-muted">Sold {formatRs(item.sold)}</p> : null}
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
            <p className="text-sm text-muted">Every live piece has more than 3 left.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {low.slice(0, 8).map((product) => (
                <li key={product.id} className="flex justify-between gap-3">
                  <Link href={`/admin/products/${product.id}`} className="hover:underline">{product.name}</Link>
                  <span className="text-sale">{product.stock} left</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 border-t border-line pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-2xl text-cocoa">Latest notes</h2>
              <Link href="/admin/inbox" className="text-sm text-sage-deep">Inbox</Link>
            </div>
            {store.messages.length === 0 ? (
              <p className="text-sm text-muted">No notes yet.</p>
            ) : (
              <ul className="space-y-3 text-sm">
                {store.messages.slice(0, 4).map((message) => (
                  <li key={message.id}>
                    <Link href={`/admin/inbox/${message.id}`} className="block hover:underline">
                      <span className="text-ink">{message.name}</span>
                      <span className="text-muted"> · {message.topic}</span>
                      {!message.read ? <span className="ml-2 text-xs text-sage-deep">New</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="font-display text-2xl text-cocoa">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm text-sage-deep">Open the book</Link>
        </div>
        {store.orders.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted">No orders yet. The book starts when someone checks out.</p>
        ) : (
          <table className="stack mt-3 w-full text-left text-sm md:min-w-[640px]">
            <thead className="text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {store.orders.slice(0, 6).map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-5 py-3">
                    <Link href={`/admin/orders/${order.number}`} className="hover:underline">{order.number}</Link>
                    <span className="block text-xs text-muted">{formatWhen(order.createdAt)}</span>
                  </td>
                  <td data-label="Customer" className="px-5 py-3">{order.name}</td>
                  <td data-label="Total" className="px-5 py-3">{formatRs(order.total)}</td>
                  <td data-label="Status" className="px-5 py-3"><StatusPill status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
