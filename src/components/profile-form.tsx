"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateProfile } from "@/actions/shop";
import { logout } from "@/actions/auth";
import { Button, Field, controlClass } from "@/components/button";
import { CITIES } from "@/lib/domain";
import type { PublicUser } from "@/lib/types";

export function ProfileForm({ user }: { user: PublicUser }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await updateProfile({
          name: data.get("name"),
          phone: data.get("phone"),
          city: data.get("city"),
        });
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Profile saved");
        router.refresh();
      }}
    >
      <Field label="Name">
        <input name="name" required defaultValue={user.name} className={controlClass} />
      </Field>
      <Field label="Email">
        <input value={user.email} readOnly className={controlClass} />
      </Field>
      <Field label="Phone">
        <input name="phone" defaultValue={user.phone} className={controlClass} />
      </Field>
      <Field label="City">
        <select name="city" defaultValue={user.city} className={controlClass}>
          <option value="">Choose a city</option>
          {CITIES.map((city) => (
            <option key={city}>{city}</option>
          ))}
        </select>
      </Field>
      <div className="flex flex-wrap gap-3">
        <Button disabled={pending}>{pending ? "Saving…" : "Save changes"}</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={async () => {
            await logout();
            toast.success("Signed out");
            router.push("/");
            router.refresh();
          }}
        >
          Sign out
        </Button>
      </div>
    </form>
  );
}
