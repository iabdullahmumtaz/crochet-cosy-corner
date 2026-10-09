"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveProduct, uploadDeskImage } from "@/actions/admin";
import { guardSave } from "@/lib/guard-save";
import { ProductArt } from "@/components/product-art";
import { Button, Field, controlClass } from "@/components/button";
import { MOTIFS, PALETTE_IDS, PALETTES, type Motif, type PaletteId } from "@/lib/domain";
import type { Product, ShopCategory } from "@/lib/types";

export function ProductForm({ product, categories }: { product?: Product; categories: ShopCategory[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [palette, setPalette] = useState<PaletteId>(product?.palette ?? "sage");
  const [motif, setMotif] = useState<Motif>(product?.motif ?? "bunny");
  const [preview, setPreview] = useState(product?.imageUrl ?? "");

  return (
    <form
      className="grid gap-8 lg:grid-cols-[1fr_280px]"
      onSubmit={async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const compareRaw = String(data.get("compareAt") ?? "").trim();
        const file = data.get("file");
        const result = await guardSave(setPending, async () => {
          let imageUrl = product?.imageUrl ?? "";
          if (file instanceof File && file.size > 0) {
            const uploaded = await uploadDeskImage(data);
            if (!uploaded.ok) return uploaded;
            imageUrl = uploaded.url;
          }
          return saveProduct({
            id: product?.id,
            name: data.get("name"),
            description: data.get("description"),
            price: Number(data.get("price")),
            compareAt: compareRaw ? Number(compareRaw) : null,
            category: data.get("category"),
            motif,
            palette,
            stock: Number(data.get("stock")),
            yarn: data.get("yarn"),
            featured: data.get("featured") === "on",
            active: data.get("active") === "on",
            imageUrl,
          });
        });
        if (!result) return;
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Piece saved");
        router.push("/admin/products");
        router.refresh();
      }}
    >
      <div className="grid gap-4">
        <Field label="Name">
          <input name="name" required defaultValue={product?.name} className={controlClass} />
        </Field>
        <Field label="Description">
          <textarea name="description" required defaultValue={product?.description} rows={4} className={`${controlClass} h-auto py-3`} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (Rs)">
            <input name="price" type="number" min={50} required defaultValue={product?.price ?? 500} className={controlClass} />
          </Field>
          <Field label="Compare at" hint="Leave blank if it isn't on sale.">
            <input name="compareAt" type="number" min={0} defaultValue={product?.compareAt ?? ""} className={controlClass} />
          </Field>
          <Field label="Stock">
            <input name="stock" type="number" min={0} required defaultValue={product?.stock ?? 1} className={controlClass} />
          </Field>
        </div>
        <Field label="Yarn">
          <input name="yarn" required defaultValue={product?.yarn ?? "Milk cotton"} className={controlClass} />
        </Field>
        <Field label="Photo" hint="JPG, PNG, or WebP under 4 MB. A new file replaces the picture on the right.">
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={controlClass}
            onChange={(event) => {
              const next = event.target.files?.[0];
              if (next) setPreview(URL.createObjectURL(next));
            }}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Collection">
            <select name="category" defaultValue={product?.category ?? categories[0]?.id} className={controlClass}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Shape">
            <select value={motif} onChange={(event) => setMotif(event.target.value as Motif)} className={controlClass}>
              {MOTIFS.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <p className="mb-2 text-sm text-bark">Colour story</p>
          <div className="flex flex-wrap gap-2">
            {PALETTE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                aria-label={id}
                onClick={() => setPalette(id)}
                className={`h-9 w-9 rounded-full border-2 ${palette === id ? "border-ink" : "border-white"}`}
                style={{ background: PALETTES[id].yarn }}
              />
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} />
          Show on the front of the shop
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product?.active ?? true} />
          Available to buy
        </label>
        <Button disabled={pending}>{pending ? "Saving…" : "Save piece"}</Button>
      </div>
      <div className="overflow-hidden rounded-[28px] border border-line bg-white">
        {preview ? (
          <img src={preview} alt="" className="aspect-[4/5] w-full object-cover" />
        ) : (
          <ProductArt motif={motif} palette={palette} />
        )}
      </div>
    </form>
  );
}
