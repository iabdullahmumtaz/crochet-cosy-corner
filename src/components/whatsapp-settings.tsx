"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveWhatsapp } from "@/actions/admin";
import { Button, Field, controlClass } from "@/components/button";

export function WhatsappSettings({ number }: { number: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="panel grid max-w-md gap-3 rounded-3xl p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const whatsapp = String(new FormData(event.currentTarget).get("whatsapp") ?? "");
        setPending(true);
        const result = await saveWhatsapp({ whatsapp });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("WhatsApp number saved");
        router.refresh();
      }}
    >
      <Field label="WhatsApp number" hint="Country code and digits only, like 923001234567. Leave blank to hide the direct link.">
        <input name="whatsapp" defaultValue={number} inputMode="numeric" className={controlClass} placeholder="923001234567" />
      </Field>
      <Button disabled={pending}>{pending ? "Saving…" : "Save number"}</Button>
    </form>
  );
}
