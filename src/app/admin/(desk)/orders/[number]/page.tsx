import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderActions } from "@/components/order-actions";
import { OrderPanel } from "@/components/order-panel";
import { readStore } from "@/lib/db";
import { formatWhenTime } from "@/lib/format";
import { STATUS_FLOW, STATUS_LABEL } from "@/lib/order-flow";

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const store = await readStore();
  const order = store.orders.find((item) => item.number === number);
  if (!order) notFound();
  const productLinks = Object.fromEntries(
    order.items.flatMap((item) => {
      const product = store.products.find((piece) => piece.id === item.productId);
      return product ? [[item.productId, `/admin/products/${product.id}`]] : [];
    }),
  );
  const current = STATUS_FLOW.indexOf(order.status as (typeof STATUS_FLOW)[number]);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-sage-deep">Back to orders</Link>
      <h1 className="mt-2 font-display text-4xl text-cocoa">{order.number}</h1>
      {order.userId ? (
        <p className="mb-6 text-sm">
          <Link href={`/admin/customers/${order.userId}`} className="text-sage-deep underline">{order.name}</Link>
          <span className="text-muted"> · {order.email}</span>
        </p>
      ) : (
        <p className="mb-6 text-sm text-muted">{order.name} · {order.email} · guest checkout</p>
      )}
      <OrderPanel order={order} productLinks={productLinks}>
        <div className="rounded-[28px] border border-line bg-white p-5">
          <h2 className="mb-3 font-display text-2xl text-cocoa">Update</h2>
          <OrderActions
            number={order.number}
            status={order.status}
            courier={order.courier}
            trackingCode={order.trackingCode}
            name={order.name}
            phone={order.phone}
            address={order.address}
            city={order.city}
          />
        </div>
      </OrderPanel>
      <section className="mt-8 rounded-[28px] border border-line bg-white p-5">
        <h2 className="font-display text-2xl text-cocoa">Full path</h2>
        <p className="mt-1 text-sm text-muted">Each step the order can take, with the note written when it moved.</p>
        <ol className="mt-4 divide-y divide-line">
          {STATUS_FLOW.map((step, index) => {
            const event = [...order.events].reverse().find((item) => item.status === step);
            const state = order.status === "cancelled" ? "ahead" : index < current ? "done" : index === current ? "now" : "ahead";
            return (
              <li key={step} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
                <p className={state === "now" ? "text-sm font-medium text-sage-deep" : "text-sm text-ink"}>
                  {STATUS_LABEL[step]}
                  {state === "now" ? " · now" : null}
                </p>
                <p className="text-sm text-muted">
                  {event ? `${event.note} · ${formatWhenTime(event.at)}` : state === "ahead" ? "Not there yet" : "No note saved"}
                </p>
              </li>
            );
          })}
          {order.status === "cancelled" ? (
            <li className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
              <p className="text-sm font-medium text-sale">{STATUS_LABEL.cancelled} · now</p>
              <p className="text-sm text-muted">
                {order.events.find((item) => item.status === "cancelled")?.note ?? "Cancelled."}
                {order.events.find((item) => item.status === "cancelled") ? ` · ${formatWhenTime(order.events.find((item) => item.status === "cancelled")!.at)}` : ""}
              </p>
            </li>
          ) : null}
        </ol>
      </section>
    </div>
  );
}
