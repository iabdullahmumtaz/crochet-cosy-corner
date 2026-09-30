"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { clearSession, getCurrentUser, passwordMatches, setSession } from "@/lib/auth";
import { readStore, updateStore } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { siteOrigin, supabaseAuth } from "@/lib/supabase";
import { loginSchema, registerSchema } from "@/lib/validators";
import type { ActionFail, ActionOk, User } from "@/lib/types";

async function callerKey() {
  const headerList = await headers();
  return headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function filledTrap(value: FormDataEntryValue | null) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function loginCustomer(formData: FormData): Promise<ActionOk | ActionFail> {
  if (filledTrap(formData.get("company"))) return { ok: false, error: "Those details don't match." };
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };

  const email = parsed.data.email.toLowerCase();
  const limited = rateLimit(`login:${email}:${await callerKey()}`, 8, 15 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  const supabase = supabaseAuth();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });
    if (data.session && data.user?.email) {
      const local = await ensureCustomer(data.user.email, data.user.user_metadata?.name, data.user.user_metadata?.phone);
      if (local) {
        await setSession(local);
        return { ok: true };
      }
    }
    if ((error?.message ?? "").toLowerCase().includes("not confirmed")) {
      return { ok: false, error: "Confirm your email first. The link is in your inbox." };
    }
  }

  const store = await readStore();
  const user = store.users.find((item) => item.email === email);
  const match = await passwordMatches(parsed.data.password, user?.passwordHash);
  if (!user || !match || user.role !== "customer") {
    return { ok: false, error: "Those details don't match." };
  }
  await setSession(user);
  return { ok: true };
}

export async function loginAdmin(formData: FormData): Promise<ActionOk | ActionFail> {
  if (filledTrap(formData.get("company"))) return { ok: false, error: "Those details don't open the studio desk." };
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };

  const email = parsed.data.email.toLowerCase();
  const limited = rateLimit(`admin:${email}:${await callerKey()}`, 8, 15 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  const store = await readStore();
  const user = store.users.find((item) => item.email === email);
  const match = await passwordMatches(parsed.data.password, user?.passwordHash);
  if (!user || !match || user.role !== "admin") {
    return { ok: false, error: "Those details don't open the studio desk." };
  }
  await setSession(user);
  return { ok: true };
}

export async function registerCustomer(formData: FormData): Promise<ActionOk | ActionFail | { ok: true; verify: true }> {
  if (filledTrap(formData.get("company"))) return { ok: false, error: "The account could not be created." };
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };

  const email = parsed.data.email.toLowerCase();
  const limited = rateLimit(`register:${await callerKey()}`, 5, 60 * 60 * 1000);
  if (limited) return { ok: false, error: limited };

  const existing = await readStore();
  if (existing.users.some((item) => item.email === email)) {
    return { ok: false, error: "An account with that email already exists." };
  }

  const supabase = supabaseAuth();
  if (!supabase) return { ok: false, error: "Sign-up email is not configured yet." };

  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/confirm`,
      data: { name: parsed.data.name, phone: parsed.data.phone },
    },
  });
  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already")) return { ok: false, error: "An account with that email already exists." };
    return { ok: false, error: "The account could not be created. Try again in a moment." };
  }
  if (!data.session) return { ok: true, verify: true };

  const user = await ensureCustomer(email, parsed.data.name, parsed.data.phone);
  if (!user) return { ok: false, error: "The account could not be created." };
  await setSession(user);
  return { ok: true };
}

async function ensureCustomer(email: string, name?: unknown, phone?: unknown) {
  const cleanEmail = email.toLowerCase();
  const cleanName = typeof name === "string" && name.trim().length >= 2 ? name.trim() : "Shopper";
  const cleanPhone = typeof phone === "string" ? phone.slice(0, 16) : "";
  const result = await updateStore((store) => {
    const found = store.users.find((item) => item.email === cleanEmail);
    if (found) return found.role === "customer" ? found : null;
    const passwordHash = bcrypt.hashSync(crypto.randomUUID(), 10);
    const user: User = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: "customer",
      phone: cleanPhone,
      city: "",
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    return user;
  });
  return result;
}

export async function resendSignupEmail(email: string): Promise<ActionOk | ActionFail> {
  const parsed = loginSchema.pick({ email: true }).safeParse({ email });
  if (!parsed.success) return { ok: false, error: "Enter the email you signed up with." };
  const clean = parsed.data.email.toLowerCase();
  const limited = rateLimit(`resend:${clean}:${await callerKey()}`, 3, 60 * 60 * 1000);
  if (limited) return { ok: false, error: limited };
  const supabase = supabaseAuth();
  if (!supabase) return { ok: false, error: "Sign-up email is not configured yet." };
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: clean,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/confirm` },
  });
  if (error) return { ok: false, error: "A new link could not be sent. Try again in a moment." };
  return { ok: true };
}

export async function completeEmailSignup(accessToken: string): Promise<ActionOk | ActionFail> {
  if (!accessToken || accessToken.length > 4000) return { ok: false, error: "That confirmation link is not valid." };
  const supabase = supabaseAuth();
  if (!supabase) return { ok: false, error: "Sign-up email is not configured yet." };
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user?.email) return { ok: false, error: "That confirmation link has expired. Sign up again." };
  const user = await ensureCustomer(data.user.email, data.user.user_metadata?.name, data.user.user_metadata?.phone);
  if (!user) return { ok: false, error: "This email is already used by the studio desk." };
  await setSession(user);
  return { ok: true };
}

export async function logout(): Promise<ActionOk> {
  const user = await getCurrentUser();
  if (!user) return { ok: true };
  await clearSession();
  return { ok: true };
}
