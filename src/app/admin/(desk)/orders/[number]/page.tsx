import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderActions } from "@/components/order-actions";
import { OrderPanel } from "@/components/order-panel";
import { readStore } from "@/lib/db";

export default async function AdminOrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const store = await readStore();
  const order = store.orders.find((item) => item.number === number);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-sage-deep">Back to orders</Link>
      <h1 className="mt-2 mb-6 font-display text-4xl text-cocoa">{order.name}</h1>
      <OrderPanel order={order}>
        <div className="rounded-[28px] border border-line bg-white p-5">
          <h2 className="mb-3 font-display text-2xl text-cocoa">Update</h2>
          <OrderActions
            number={order.number}
            status={order.status}
            courier={order.courier}
            trackingCode={order.trackingCode}
          />
        </div>
      </OrderPanel>
    </div>
  );
}
