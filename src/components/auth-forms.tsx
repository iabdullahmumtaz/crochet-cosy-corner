"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { loginAdmin, loginCustomer, registerCustomer, resendSignupEmail } from "@/actions/auth";
import { Button, Field, controlClass } from "@/components/button";

function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${controlClass} pr-12`} />
      <button
        type="button"
        className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-blush hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

export function LoginForm({
  mode,
  from,
}: {
  mode: "customer" | "admin";
  from: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");

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
          setConfirmEmail(mode === "customer" && result.error.includes("Confirm your email") ? String(data.get("email") ?? "") : "");
          return;
        }
        setConfirmEmail("");
        toast.success("Signed in");
        router.push(from);
        router.refresh();
      }}
    >
      <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={controlClass} />
      </Field>
      <Field label="Password">
        <PasswordInput name="password" required autoComplete="current-password" />
      </Field>
      <Button disabled={pending}>{pending ? "Signing in…" : mode === "admin" ? "Open the desk" : "Sign in"}</Button>
      {confirmEmail ? (
        <button
          type="button"
          className="text-left text-sm text-sage-deep underline"
          onClick={async () => {
            setPending(true);
            const result = await resendSignupEmail(confirmEmail);
            setPending(false);
            if (!result.ok) {
              toast.error(result.error);
              return;
            }
            toast.success("A new confirmation link is on its way.");
          }}
        >
          Send a new confirmation link
        </button>
      ) : null}
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
        <PasswordInput name="password" required minLength={8} autoComplete="new-password" />
      </Field>
      <Button disabled={pending}>{pending ? "Creating…" : "Create account"}</Button>
    </form>
  );
}
