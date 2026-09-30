"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { removeAddress, saveAddress } from "@/actions/shop";
import { Button, Field, controlClass } from "@/components/button";
import { CITIES } from "@/lib/domain";
import type { SavedAddress } from "@/lib/types";

export function AddressBook({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <div className="grid gap-6">
      <ul className="space-y-3">
        {addresses.length === 0 ? <li className="text-sm text-muted">No saved addresses yet.</li> : null}
        {addresses.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 rounded-3xl border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white px-4 py-4">
            <span>
              <span className="block font-semibold">{item.label}</span>
              <span className="text-sm text-muted">{item.line} · {item.city} · {item.phone}</span>
            </span>
            <button
              type="button"
              className="text-sm font-semibold text-sale"
              onClick={async () => {
                const result = await removeAddress(item.id);
                if (!result.ok) toast.error(result.error);
                else router.refresh();
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="grid gap-3 rounded-[28px] border border-line shadow-[0_18px_40px_-30px_rgba(22,18,26,0.4)] bg-white p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setPending(true);
          const result = await saveAddress({
            label: data.get("label"),
            line: data.get("line"),
            city: data.get("city"),
            phone: data.get("phone"),
          });
          setPending(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("Address saved");
          event.currentTarget.reset();
          router.refresh();
        }}
      >
        <Field label="Label">
          <input name="label" required className={controlClass} placeholder="Home" />
        </Field>
        <Field label="Street">
          <input name="line" required className={controlClass} />
        </Field>
        <Field label="City">
          <select name="city" className={controlClass} defaultValue="Karachi">
            {CITIES.map((city) => <option key={city}>{city}</option>)}
          </select>
        </Field>
        <Field label="Phone">
          <input name="phone" required className={controlClass} />
        </Field>
        <Button disabled={pending}>{pending ? "Saving…" : "Save address"}</Button>
      </form>
    </div>
  );
}
