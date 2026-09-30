"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "cosy-recent";

export function RememberPiece({ slug, name }: { slug: string; name: string }) {
  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as { slug: string; name: string }[]) : [];
    const next = [{ slug, name }, ...list.filter((item) => item.slug !== slug)].slice(0, 6);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }, [slug, name]);
  return null;
}

export function RecentPieces({ current }: { current?: string }) {
  const [items, setItems] = useState<{ slug: string; name: string }[]>([]);
  useEffect(() => {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return;
    const list = JSON.parse(raw) as { slug: string; name: string }[];
    setItems(list.filter((item) => item.slug !== current).slice(0, 4));
  }, [current]);
  if (items.length === 0) return null;
  return (
    <section className="mt-14">
      <h2 className="font-display text-3xl text-bark">You just looked at</h2>
      <ul className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link href={`/product/${item.slug}`} className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm transition hover:border-ink/20 hover:bg-blush">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
