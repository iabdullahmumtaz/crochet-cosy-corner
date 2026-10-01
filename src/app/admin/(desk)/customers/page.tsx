import Link from "next/link";
import { DeskPager } from "@/components/desk-pager";
import { readStore } from "@/lib/db";
import { formatRs, formatWhen } from "@/lib/format";
import { pageOf, parsePage } from "@/lib/paging";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; guest?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const store = await readStore();
  const customers = store.users
    .filter((user) => user.role === "customer")
    .map((user) => {
      const orders = store.orders.filter((order) => (order.userId === user.id || order.email === user.email) && order.status !== "cancelled");
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        city: user.city,
        phone: user.phone,
        createdAt: user.createdAt,
        orders: orders.length,
        spent: orders.reduce((sum, order) => sum + order.total, 0),
      };
    })
    .filter((customer) => !q || [customer.name, customer.email, customer.city, customer.phone].join(" ").toLowerCase().includes(q));
  const accountEmails = new Set(store.users.filter((user) => user.role === "customer").map((user) => user.email));
  const guests = new Map<string, { email: string; name: string; city: string; orders: number; spent: number }>();
  for (const order of store.orders) {
    if (order.userId || accountEmails.has(order.email)) continue;
    const current = guests.get(order.email) ?? { email: order.email, name: order.name, city: order.city, orders: 0, spent: 0 };
    if (order.status !== "cancelled") {
      current.orders += 1;
      current.spent += order.total;
    }
    guests.set(order.email, current);
  }
  const guestRows = [...guests.values()].filter((guest) => !q || [guest.name, guest.email, guest.city].join(" ").toLowerCase().includes(q));
  const { items, ...pager } = pageOf(customers, parsePage(params.page));
  const { items: guestItems, ...guestPager } = pageOf(guestRows, parsePage(params.guest));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-cocoa">Customers</h1>
          <p className="mt-1 text-sm text-muted">Open a name for addresses, edits, and that shopper’s orders.</p>
        </div>
        <form>
          <input name="q" defaultValue={params.q ?? ""} placeholder="Search customers" className="h-12 rounded-full border border-line bg-white px-4 text-sm" />
        </form>
      </div>
      <div className="mt-6 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="stack w-full text-left text-sm md:min-w-[680px]">
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
            {items.map((customer) => (
              <tr key={customer.id} className="border-t border-line">
                <td className="px-4 py-3"><Link href={`/admin/customers/${customer.id}`} className="hover:underline">{customer.name}</Link></td>
                <td data-label="Email" className="px-4 py-3 text-muted">{customer.email}</td>
                <td data-label="City" className="px-4 py-3">{customer.city || "—"}</td>
                <td data-label="Orders" className="px-4 py-3">{customer.orders}</td>
                <td data-label="Spent" className="px-4 py-3">{formatRs(customer.spent)}</td>
                <td data-label="Joined" className="px-4 py-3 text-muted">{formatWhen(customer.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No shopper accounts yet.</p> : null}
        <DeskPager {...pager} pathname="/admin/customers" params={{ q: params.q, guest: params.guest }} />
      </div>
      <h2 className="mt-8 font-display text-3xl text-cocoa">Guest checkouts</h2>
      <div className="mt-4 overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="stack w-full text-left text-sm md:min-w-[640px]">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Spent</th>
            </tr>
          </thead>
          <tbody>
            {guestItems.map((guest) => (
              <tr key={guest.email} className="border-t border-line">
                <td className="px-4 py-3">{guest.name}</td>
                <td data-label="Email" className="px-4 py-3 text-muted">{guest.email}</td>
                <td data-label="City" className="px-4 py-3">{guest.city || "—"}</td>
                <td data-label="Orders" className="px-4 py-3">{guest.orders}</td>
                <td data-label="Spent" className="px-4 py-3">{formatRs(guest.spent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {guestRows.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No guest checkouts.</p> : null}
        <DeskPager {...guestPager} pathname="/admin/customers" pageKey="guest" params={{ q: params.q, page: params.page }} />
      </div>
    </div>
  );
}
