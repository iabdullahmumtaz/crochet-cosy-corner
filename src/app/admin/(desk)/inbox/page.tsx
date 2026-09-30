import { InboxList } from "@/components/inbox-list";
import { readStore } from "@/lib/db";
import { formatWhenTime } from "@/lib/format";

export default async function InboxPage() {
  const store = await readStore();
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section>
        <h1 className="font-display text-4xl text-cocoa">Inbox</h1>
        <p className="mt-1 mb-5 text-sm text-muted">Messages from the contact page. Reply from your own mail.</p>
        <InboxList
          messages={store.messages.map((message) => ({
            id: message.id,
            name: message.name,
            email: message.email,
            topic: message.topic,
            body: message.body,
            read: message.read,
            when: formatWhenTime(message.createdAt),
          }))}
        />
      </section>
      <section>
        <h2 className="font-display text-3xl text-cocoa">Mailing list</h2>
        <p className="mt-1 mb-5 text-sm text-muted">{store.subscribers.length} addresses. Sending mail is not connected.</p>
        <ul className="space-y-2">
          {store.subscribers.map((subscriber) => (
            <li key={subscriber.id} className="rounded-2xl border border-line bg-white px-4 py-3 text-sm">
              {subscriber.email}
              <span className="mt-1 block text-xs text-muted">{formatWhenTime(subscriber.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
