"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeSubscriber, saveNextNumber, saveWhatsapp } from "@/actions/admin";
import { Button, Field, controlClass } from "@/components/button";

export function DeskSettings({
  number,
  seq,
  subscribers,
  pager,
}: {
  number: string;
  seq: number;
  subscribers: { id: string; email: string }[];
  pager?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="grid gap-3 rounded-[28px] border border-line bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const whatsapp = await saveWhatsapp({ whatsapp: data.get("whatsapp") ?? "" });
          const next = await saveNextNumber({ seq: Number(data.get("seq")) });
          setPending(false);
          if (!whatsapp.ok) {
            toast.error(whatsapp.error);
            return;
          }
          if (!next.ok) {
            toast.error(next.error);
            return;
          }
          toast.success("Desk settings saved");
          router.refresh();
        }}
      >
        <h2 className="font-display text-2xl text-cocoa">Shop numbers</h2>
        <Field label="WhatsApp" hint="Digits with country code, like 923001234567. Blank hides the chat link.">
          <input name="whatsapp" defaultValue={number} inputMode="numeric" className={controlClass} placeholder="923001234567" />
        </Field>
        <Field label="Next order number" hint={`The next checkout becomes CC-${seq}. It is stored in the database.`}>
          <input name="seq" type="number" min={1000} required defaultValue={seq} className={controlClass} />
        </Field>
        <Button disabled={pending}>{pending ? "Saving…" : "Save"}</Button>
      </form>
      <section className="rounded-[28px] border border-line bg-white p-5">
        <h2 className="font-display text-2xl text-cocoa">Mailing list</h2>
        <ul className="mt-4 space-y-2">
          {subscribers.length === 0 ? <li className="text-sm text-muted">No one has joined yet.</li> : null}
          {subscribers.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{person.email}</span>
              <button
                type="button"
                className="text-sale"
                onClick={async () => {
                  const result = await removeSubscriber(person.id);
                  if (!result.ok) toast.error(result.error);
                  else {
                    toast.success("Removed from the list");
                    router.refresh();
                  }
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {pager}
      </section>
    </div>
  );
}
