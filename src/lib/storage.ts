import "server-only";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "shop";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function uploadShopImage(file: File, folder: "products" | "categories") {
  if (!file.size) return { ok: true as const, url: "" };
  if (!file.type.startsWith("image/") || file.size > 4_000_000) {
    return { ok: false as const, error: "Use a JPG, PNG, or WebP under 4 MB." };
  }
  const supabase = adminClient();
  if (!supabase) return { ok: false as const, error: "Image storage is not configured." };

  const existing = await supabase.storage.getBucket(BUCKET);
  if (existing.error) {
    const created = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 4_000_000,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    });
    if (created.error && !created.error.message.toLowerCase().includes("already")) {
      return { ok: false as const, error: "The image folder could not be opened." };
    }
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false as const, error: "The image could not be saved." };
  return { ok: true as const, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
}
