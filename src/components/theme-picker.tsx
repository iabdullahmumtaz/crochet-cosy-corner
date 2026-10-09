"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveTheme } from "@/actions/admin";
import { guardSave } from "@/lib/guard-save";
import { Button } from "@/components/button";
import { THEMES, type ThemeId } from "@/lib/themes";

export function ThemePicker({ current }: { current: ThemeId }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [picked, setPicked] = useState(current);

  return (
    <form
      className="rounded-[28px] border border-line bg-white p-5"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await guardSave(setPending, () => saveTheme({ theme: picked }));
        if (!result) return;
        if (!result.ok) {
          toast.error(result.error);
          return;
        }
        toast.success("Theme saved");
        router.refresh();
      }}
    >
      <h2 className="font-display text-2xl text-cocoa">Theme</h2>
      <p className="mt-1 text-sm text-muted">This changes the shop and the desk. Buttons, paper, and type color all follow it.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {THEMES.map((theme) => {
          const on = picked === theme.id;
          return (
            <label
              key={theme.id}
              className={`cursor-pointer rounded-3xl border p-4 ${on ? "border-sage bg-foam" : "border-line bg-white"}`}
            >
              <input
                type="radio"
                name="theme"
                value={theme.id}
                checked={on}
                onChange={() => setPicked(theme.id)}
                className="sr-only"
              />
              <span className="flex gap-1.5" aria-hidden>
                {theme.swatches.map((swatch) => (
                  <span key={swatch} className="h-8 flex-1 rounded-full" style={{ background: swatch }} />
                ))}
              </span>
              <span className="mt-3 block text-sm font-medium text-ink">{theme.label}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{theme.line}</span>
            </label>
          );
        })}
      </div>
      <div className="mt-4">
        <Button disabled={pending || picked === current}>{pending ? "Saving…" : "Save theme"}</Button>
      </div>
    </form>
  );
}
