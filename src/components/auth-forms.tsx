"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAdmin, loginCustomer, registerCustomer } from "@/actions/auth";
import { Button, Field, controlClass } from "@/components/button";

export function LoginForm({
  mode,
  from,
}: {
  mode: "customer" | "admin";
  from: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const sample =
    mode === "admin"
      ? { email: "studio@cosycorner.shop", password: "CosyAdmin!2026", label: "Use the studio sample" }
      : { email: "amina@cosycorner.shop", password: "CosyShop!2026", label: "Use the shopper sample" };

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = mode === "admin" ? await loginAdmin(data) : await loginCustomer(data);
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Signed in");
        router.push(from);
        router.refresh();
      }}
    >
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className={controlClass} />
      </Field>
      <Field label="Password">
        <input name="password" type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className={controlClass} />
      </Field>
      <Button disabled={pending}>{pending ? "Signing in…" : mode === "admin" ? "Open the desk" : "Sign in"}</Button>
      <button
        type="button"
        className="text-left text-sm text-sage-deep underline"
        onClick={() => {
          setEmail(sample.email);
          setPassword(sample.password);
        }}
      >
        {sample.label}
      </button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setPending(true);
        const result = await registerCustomer(data);
        setPending(false);
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        if ("verify" in result && result.verify) {
          toast.success("Check your email", { description: "Open the confirmation link, then sign in." });
          router.push("/login");
          return;
        }
        toast.success("Account created");
        router.push("/account");
        router.refresh();
      }}
    >
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Name">
        <input name="name" required autoComplete="name" className={controlClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={controlClass} />
      </Field>
      <Field label="Phone" hint="Optional. Useful when a courier calls.">
        <input name="phone" autoComplete="tel" className={controlClass} />
      </Field>
      <Field label="Password" hint="At least 8 characters.">
        <input name="password" type="password" required minLength={8} autoComplete="new-password" className={controlClass} />
      </Field>
      <Button disabled={pending}>{pending ? "Creating…" : "Create account"}</Button>
    </form>
  );
}
