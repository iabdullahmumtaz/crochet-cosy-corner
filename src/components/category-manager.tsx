"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory, saveCategory, uploadDeskImage } from "@/actions/admin";
import { CardPhoto } from "@/components/card-photo";
import { Button, Field, controlClass } from "@/components/button";
import { MOTIFS, PALETTE_IDS } from "@/lib/domain";
import type { ShopCategory } from "@/lib/types";

export function CategoryManager({ categories }: { categories: ShopCategory[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const current = categories.find((item) => item.id === editing);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="overflow-x-auto rounded-[28px] border border-line bg-white">
        <table className="stack w-full text-left text-sm md:min-w-[520px]">
          <thead className="text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Collection</th>
              <th className="px-4 py-3 font-medium"> </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t border-line">
                <td className="px-4 py-2">
                  <span className="flex items-center gap-3">
                    {category.imageUrl ? (
                      <CardPhoto src={category.imageUrl} className="h-14 w-14 shrink-0 rounded-full" />
                    ) : (
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-foam text-[10px] text-muted">None</span>
                    )}
                    <span>
                      <span className="block text-ink">{category.label}</span>
                      <span className="text-muted">{category.blurb}</span>
                    </span>
                  </span>
                </td>
                <td data-label="" className="px-4 py-2">
                  <span className="flex justify-end gap-3 md:justify-end">
                    <button type="button" className="font-medium text-sage-deep" onClick={() => setEditing(category.id)}>Edit</button>
                    <button
                      type="button"
                      className="font-medium text-sale"
                      onClick={async () => {
                        const result = await deleteCategory(category.id);
                        if (!result.ok) toast.error(result.error);
                        else {
                          toast.success("Collection removed");
                          router.refresh();
                        }
                      }}
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        key={current?.id ?? "new"}
        className="panel grid h-fit gap-3 rounded-3xl p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const file = data.get("file");
          setPending(true);
          let imageUrl = current?.imageUrl ?? "";
          if (file instanceof File && file.size > 0) {
            const uploadData = new FormData();
            uploadData.set("file", file);
            uploadData.set("folder", "categories");
            const uploaded = await uploadDeskImage(uploadData);
            if (!uploaded.ok) {
              setPending(false);
              toast.error(uploaded.error);
              return;
            }
            imageUrl = uploaded.url;
          }
          const result = await saveCategory({
            id: current?.id ?? "",
            label: data.get("label"),
            blurb: data.get("blurb"),
            motif: data.get("motif"),
            palette: data.get("palette"),
            imageUrl,
          });
          setPending(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success(current ? "Collection updated" : "Collection added");
          setEditing(null);
          event.currentTarget.reset();
          router.refresh();
        }}
      >
        <Field label="Name">
          <input name="label" required defaultValue={current?.label ?? ""} className={controlClass} />
        </Field>
        <Field label="Short line">
          <textarea name="blurb" required defaultValue={current?.blurb ?? ""} rows={3} className={`${controlClass} h-auto py-3`} />
        </Field>
        <Field label="Picture shape">
          <select name="motif" defaultValue={current?.motif ?? "bunny"} className={controlClass}>
            {MOTIFS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>
        </Field>
        <Field label="Photo" hint="Optional. JPG, PNG, or WebP under 4 MB.">
          <input name="file" type="file" accept="image/jpeg,image/png,image/webp" className={controlClass} />
        </Field>
        <Field label="Colour">
          <select name="palette" defaultValue={current?.palette ?? "blush"} className={controlClass}>
            {PALETTE_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
          </select>
        </Field>
        <Button disabled={pending}>{pending ? "Saving…" : current ? "Save collection" : "Add collection"}</Button>
        {current ? (
          <button type="button" className="text-sm text-muted" onClick={() => setEditing(null)}>Add a new one instead</button>
        ) : null}
      </form>
    </div>
  );
}
