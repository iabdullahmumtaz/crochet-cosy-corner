"use client";

import { useState } from "react";
import { toast } from "sonner";
import { subscribe } from "@/actions/shop";
import { guardSave } from "@/lib/guard-save";
import { buttonClass, controlClass } from "@/components/button";

export function NewsletterForm() {
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid w-full gap-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const email = String(new FormData(event.currentTarget).get("email") ?? "");
        const result = await guardSave(setPending, () => subscribe({ email }));
        if (!result) return;
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        event.currentTarget.reset();
        toast.success("already" in result ? "You're already on the list" : "You're on the list");
      }}
    >
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="Email address"
        aria-label="Email address"
        className={controlClass}
      />
      <button className={buttonClass("solid", "w-full whitespace-nowrap")} disabled={pending}>
        {pending ? "Joining…" : "Join the list"}
      </button>
    </form>
  );
}
