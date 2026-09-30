"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markMessage } from "@/actions/admin";

export function InboxList({
  messages,
}: {
  messages: { id: string; name: string; email: string; topic: string; body: string; read: boolean; when: string }[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  if (messages.length === 0) {
    return <p className="rounded-3xl border border-dashed border-line bg-white px-5 py-8 text-sm text-muted">The inbox is clear.</p>;
  }

  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li key={message.id} className="rounded-3xl border border-line bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm text-ink">{message.name}</p>
              <p className="text-xs text-muted">{message.email} · {message.topic}</p>
            </div>
            <span className={`rounded-full px-2 py-1 text-[11px] ${message.read ? "bg-foam text-muted" : "bg-[#f8efd4] text-[#7a5b12]"}`}>
              {message.read ? "Read" : "New"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6">{message.body}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted">{message.when}</span>
            <button
              className="text-sm text-sage-deep underline"
              disabled={pending === message.id}
              onClick={async () => {
                setPending(message.id);
                const result = await markMessage(message.id, !message.read);
                setPending(null);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success(message.read ? "Marked new" : "Marked read");
                router.refresh();
              }}
            >
              {message.read ? "Mark new" : "Mark read"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
