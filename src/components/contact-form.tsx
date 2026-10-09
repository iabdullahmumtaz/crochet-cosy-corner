"use client";

import { useState } from "react";
import { toast } from "sonner";
import { sendMessage } from "@/actions/shop";
import { guardSave } from "@/lib/guard-save";
import { Button, Field, controlClass } from "@/components/button";

const topics = ["Order", "Custom piece", "Crochet kit", "Something else"] as const;

export function ContactForm() {
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const result = await guardSave(setPending, () => sendMessage({
          name: data.get("name"),
          email: data.get("email"),
          topic: data.get("topic"),
          body: data.get("body"),
          company: data.get("company"),
        }));
        if (!result) return;
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        event.currentTarget.reset();
        toast.success("Message sent");
      }}
    >
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Name">
        <input name="name" required className={controlClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required className={controlClass} />
      </Field>
      <Field label="Topic">
        <select name="topic" className={controlClass}>
          {topics.map((topic) => (
            <option key={topic}>{topic}</option>
          ))}
        </select>
      </Field>
      <Field label="Message">
        <textarea name="body" required rows={5} className={`${controlClass} h-auto py-3`} />
      </Field>
      <Button disabled={pending}>{pending ? "Sending…" : "Send message"}</Button>
    </form>
  );
}
