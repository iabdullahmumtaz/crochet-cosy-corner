import Link from "next/link";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";

export default async function CustomersPage() {
  const store = await readStore();
  const customers = store.users
    .filter((user) => user.role === "customer")
    .map((user) => {
      const orders = store.orders.filter((order) => order.userId === user.id && order.status !== "cancelled");
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        createdAt: user.createdAt,
        orders: orders.length,
        spent: orders.reduce((sum, order) => sum + order.total, 0),
      };
    });

  return (
    <div>
      <h1 className="font-display text-4xl text-cocoa">Customers</h1>
      <p className="mt-1 text-sm text-muted">Shopper accounts only. Guest checkouts stay on the order itself.</p>
      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t border-line">
                <td className="px-4 py-3"><Link href={`/admin/customers/${customer.id}`} className="hover:underline">{customer.name}</Link></td>
                <td className="px-4 py-3 text-muted">{customer.email}</td>
                <td className="px-4 py-3">{customer.city || "—"}</td>
                <td className="px-4 py-3">{customer.orders}</td>
                <td className="px-4 py-3">{formatRs(customer.spent)}</td>
                <td className="px-4 py-3 text-muted">{formatWhen(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No shopper accounts yet.</p> : null}
      </div>
    </div>
  );
}
