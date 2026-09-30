import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { readStore } from "@/lib/db";
import {
  RECEIPT_COOKIE,
  SESSION_COOKIE,
  receiptCookie,
  sessionCookie,
  signToken,
  verifyToken,
} from "@/lib/token";
import type { Order, PublicUser, Role, SavedAddress } from "@/lib/types";

export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string;
    city: string;
    addresses?: SavedAddress[];
    createdAt: string;
  passwordHash?: string;
}): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    city: user.city,
    addresses: user.addresses ?? [],
    createdAt: user.createdAt,
  };
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const jar = await cookies();
  const token = await verifyToken(jar.get(SESSION_COOKIE)?.value);
  if (!token || token.kind !== "session") return null;
  const store = await readStore();
  const user = store.users.find((item) => item.id === token.uid);
  if (!user || user.role !== token.role) return null;
  return toPublicUser(user);
}

export async function requireRole(role: Role) {
  const user = await getCurrentUser();
  if (!user || user.role !== role) return null;
  return user;
}

export async function setSession(user: { id: string; role: Role }) {
  const token = await signToken({
    kind: "session",
    uid: user.id,
    role: user.role,
    exp: Date.now() + sessionCookie.maxAge * 1000,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, sessionCookie);
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function setReceipt(orderNumber: string) {
  const token = await signToken({
    kind: "receipt",
    order: orderNumber,
    exp: Date.now() + receiptCookie.maxAge * 1000,
  });
  const jar = await cookies();
  jar.set(RECEIPT_COOKIE, token, receiptCookie);
}

export async function canViewOrder(order: Order) {
  const user = await getCurrentUser();
  if (user?.role === "admin") return true;
  if (user && order.userId === user.id) return true;
  const jar = await cookies();
  const token = await verifyToken(jar.get(RECEIPT_COOKIE)?.value);
  return token?.kind === "receipt" && token.order === order.number;
}

let dummyHash: string | null = null;

export async function passwordMatches(password: string, hash: string | undefined) {
  if (!dummyHash) dummyHash = await bcrypt.hash("timing-pad-cosy-corner", 10);
  return bcrypt.compare(password, hash ?? dummyHash);
}
