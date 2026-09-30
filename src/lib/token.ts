export const SESSION_COOKIE = "cosy_session";
export const RECEIPT_COOKIE = "cosy_receipt";

export type SessionToken = {
  kind: "session";
  uid: string;
  role: "admin" | "customer";
  exp: number;
};

export type ReceiptToken = {
  kind: "receipt";
  order: string;
  exp: number;
};

export type TokenPayload = SessionToken | ReceiptToken;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) return null;
  return value;
}

function bytesToB64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function b64UrlToBytes(value: string) {
  const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/") + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(keyText: string, data: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyText),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(signature);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readPayload(value: unknown): TokenPayload | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.exp !== "number" || record.exp < Date.now()) return null;
  if (record.kind === "session") {
    if (
      (record.role === "admin" || record.role === "customer") &&
      typeof record.uid === "string" &&
      record.uid.length > 0 &&
      record.uid.length < 80
    ) {
      return { kind: "session", uid: record.uid, role: record.role, exp: record.exp };
    }
    return null;
  }
  if (
    record.kind === "receipt" &&
    typeof record.order === "string" &&
    /^CC-\d+$/.test(record.order)
  ) {
    return { kind: "receipt", order: record.order, exp: record.exp };
  }
  return null;
}

export async function signToken(payload: TokenPayload) {
  const key = secret();
  if (!key) throw new Error("AUTH_SECRET is missing");
  const body = bytesToB64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = bytesToB64Url(await hmac(key, body));
  return `${body}.${signature}`;
}

export async function verifyToken(token: string | undefined | null): Promise<TokenPayload | null> {
  const key = secret();
  if (!key || !token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || token.split(".").length !== 2) return null;
  const expected = bytesToB64Url(await hmac(key, body));
  if (!safeEqual(expected, signature)) return null;
  try {
    const json = new TextDecoder().decode(b64UrlToBytes(body));
    return readPayload(JSON.parse(json));
  } catch {
    return null;
  }
}

export const sessionCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export const receiptCookie = {
  ...sessionCookie,
  maxAge: 60 * 60 * 24 * 14,
};
