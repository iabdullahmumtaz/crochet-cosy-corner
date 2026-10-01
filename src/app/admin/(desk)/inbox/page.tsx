import Link from "next/link";
import { DeskPager } from "@/components/desk-pager";
import { readStore } from "@/lib/db";
import { formatWhenTime } from "@/lib/format";
import { pageOf, parsePage } from "@/lib/paging";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; list?: string }>;
}) {
  const params = await searchParams;
  const store = await readStore();
  const { items, ...pager } = pageOf(store.messages, parsePage(params.page));
  const { items: people, ...listPager } = pageOf(store.subscribers ?? [], parsePage(params.list));

  return (
    <div className="grid gap-8">
      <section>
        <h1 className="font-display text-4xl text-cocoa">Inbox</h1>
        <p className="mt-1 mb-5 text-sm text-muted">Open a note to read it and reply from your own mail.</p>
        <div className="overflow-x-auto rounded-[28px] border border-line bg-white">
          <table className="stack w-full text-left text-sm md:min-w-[640px]">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Topic</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((message) => (
                <tr key={message.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link href={`/admin/inbox/${message.id}`} className="hover:underline">{message.name}</Link>
                    <span className="block text-xs text-muted">{message.email}</span>
                  </td>
                  <td data-label="Topic" className="px-4 py-3">
                    <Link href={`/admin/inbox/${message.id}`} className="hover:underline">{message.topic}</Link>
                  </td>
                  <td data-label="When" className="px-4 py-3 text-muted">{formatWhenTime(message.createdAt)}</td>
                  <td data-label="Status" className="px-4 py-3">{message.read ? "Read" : "New"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {store.messages.length === 0 ? <p className="px-4 py-8 text-sm text-muted">The inbox is clear.</p> : null}
          <DeskPager {...pager} pathname="/admin/inbox" params={{ list: params.list }} />
        </div>
      </section>
      <section>
        <h2 className="font-display text-3xl text-cocoa">Mailing list</h2>
        <p className="mt-1 mb-5 text-sm text-muted">{store.subscribers.length} addresses. Sending mail is not connected. Remove someone from Settings.</p>
        <div className="overflow-x-auto rounded-[28px] border border-line bg-white">
          <table className="stack w-full text-left text-sm md:min-w-[480px]">
            <thead className="text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {people.map((subscriber) => (
                <tr key={subscriber.id} className="border-t border-line">
                  <td className="px-4 py-3">{subscriber.email}</td>
                  <td data-label="Joined" className="px-4 py-3 text-muted">{formatWhenTime(subscriber.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {people.length === 0 ? <p className="px-4 py-8 text-sm text-muted">No one has joined yet.</p> : null}
          <DeskPager {...listPager} pathname="/admin/inbox" pageKey="list" params={{ page: params.page }} />
        </div>
      </section>
    </div>
  );
}
