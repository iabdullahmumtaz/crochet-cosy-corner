"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateCustomer } from "@/actions/admin";
import { Button, Field, controlClass } from "@/components/button";
import { CITIES } from "@/lib/domain";

export function CustomerEditor({
  id,
  name,
  phone,
  city,
}: {
  id: string;
  name: string;
  phone: string;
  city: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-6 grid max-w-lg gap-3 rounded-[28px] border border-line bg-white p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await updateCustomer({
          id,
          name: data.get("name"),
          phone: data.get("phone") ?? "",
          city: data.get("city") ?? "",
        });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Customer saved");
        router.refresh();
      }}
    >
      <h2 className="font-display text-2xl text-cocoa">Edit shopper</h2>
      <Field label="Name">
        <input name="name" required defaultValue={name} className={controlClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" defaultValue={phone} className={controlClass} />
      </Field>
      <Field label="City">
        <select name="city" defaultValue={city} className={controlClass}>
          <option value="">Choose a city</option>
          {CITIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </Field>
      <Button disabled={pending}>{pending ? "Saving…" : "Save customer"}</Button>
    </form>
  );
}
