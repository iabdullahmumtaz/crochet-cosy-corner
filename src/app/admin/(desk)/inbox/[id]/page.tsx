import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageActions } from "@/components/message-actions";
import { readStore } from "@/lib/db";
import { formatWhenTime } from "@/lib/format";

export default async function InboxNotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const message = store.messages.find((item) => item.id === id);
  if (!message) notFound();

  return (
    <div>
      <Link href="/admin/inbox" className="text-sm text-sage-deep">Back to inbox</Link>
      <p className="mt-3 text-sm text-muted">{message.read ? "Read" : "New"} · {formatWhenTime(message.createdAt)}</p>
      <h1 className="mt-1 font-display text-4xl text-cocoa">{message.topic}</h1>
      <div className="mt-6 max-w-2xl rounded-[28px] border border-line bg-white p-5 sm:p-7">
        <p className="text-sm text-ink">{message.name}</p>
        <p className="text-sm text-muted">{message.email}</p>
        <p className="mt-5 whitespace-pre-wrap leading-7">{message.body}</p>
        <div className="mt-6">
          <MessageActions id={message.id} read={message.read} email={message.email} />
        </div>
      </div>
    </div>
  );
}
