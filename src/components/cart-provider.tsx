"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { Toaster } from "sonner";
import { ProductArt } from "@/components/product-art";
import { buttonClass } from "@/components/button";
import { formatRs } from "@/lib/format";
import type { Motif, PaletteId } from "@/lib/domain";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  qty: number;
  motif: Motif;
  palette: PaletteId;
  imageUrl?: string;
};

export type CartPhoto = { id: string; slug: string; imageUrl: string };

function withPhoto(item: CartItem, photos: Map<string, string>) {
  return { ...item, imageUrl: item.imageUrl || photos.get(item.productId) || photos.get(item.slug) || "" };
}

export function BasketPhoto({ item }: { item: CartItem }) {
  if (item.imageUrl) {
    return <img src={item.imageUrl} alt="" className="aspect-square h-full w-full object-cover" />;
  }
  return <ProductArt motif={item.motif} palette={item.palette} />;
}

type CartContextValue = {
  items: CartItem[];
  keepsakes: string[];
  ready: boolean;
  count: number;
  add: (item: CartItem) => "added" | "updated" | "max";
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  toggleKeep: (productId: string) => boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("Basket is only available inside the shop.");
  return value;
}

export function CartProvider({ children, photos = [] }: { children: React.ReactNode; photos?: CartPhoto[] }) {
  const photoMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const photo of photos) {
      if (photo.imageUrl) {
        map.set(photo.id, photo.imageUrl);
        map.set(photo.slug, photo.imageUrl);
      }
    }
    return map;
  }, [photos]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [keepsakes, setKeepsakes] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cosy-cart");
      const storedKeeps = localStorage.getItem("cosy-keeps");
      if (storedCart) setItems(JSON.parse(storedCart) as CartItem[]);
      if (storedKeeps) setKeepsakes(JSON.parse(storedKeeps) as string[]);
    } catch {
      /* ignore a broken local basket */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("cosy-cart", JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("cosy-keeps", JSON.stringify(keepsakes));
  }, [keepsakes, ready]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pictured = useMemo(() => items.map((item) => withPhoto(item, photoMap)), [items, photoMap]);

  const value = useMemo<CartContextValue>(() => {
    return {
      items: pictured,
      keepsakes,
      ready,
      count: items.reduce((sum, item) => sum + item.qty, 0),
      open,
      setOpen,
      add(item) {
        const existing = items.find((row) => row.productId === item.productId);
        if (existing && existing.qty >= 5) return "max";
        if (existing) {
          setItems((current) =>
            current.map((row) =>
              row.productId === item.productId
                ? { ...row, imageUrl: item.imageUrl || row.imageUrl, qty: Math.min(5, row.qty + item.qty) }
                : row,
            ),
          );
          setOpen(true);
          return "updated";
        }
        setItems((current) => [...current, { ...item, qty: Math.min(5, item.qty) }]);
        setOpen(true);
        return "added";
      },
      setQty(productId, qty) {
        setItems((current) =>
          current
            .map((row) => (row.productId === productId ? { ...row, qty } : row))
            .filter((row) => row.qty > 0),
        );
      },
      remove(productId) {
        setItems((current) => current.filter((row) => row.productId !== productId));
      },
      clear() {
        setItems([]);
      },
      toggleKeep(productId) {
        const has = keepsakes.includes(productId);
        setKeepsakes((current) => (has ? current.filter((id) => id !== productId) : [...current, productId]));
        return !has;
      },
    };
  }, [pictured, keepsakes, open, ready]);

  const subtotal = pictured.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={value}>
      {children}
      <Toaster
        position="top-center"
        closeButton
        offset={12}
        duration={2600}
        icons={{ success: null, error: null, info: null, warning: null, loading: null }}
        style={{ ["--width" as string]: "360px" }}
        toastOptions={{
          classNames: {
            toast: "cosy-toast",
            title: "cosy-toast-title",
            closeButton: "cosy-toast-close",
          },
        }}
      />
      {open ? (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-ink/30" aria-label="Close basket" onClick={() => setOpen(false)} />
          <aside className="absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-sand shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="font-display text-2xl text-cocoa">Your basket</h2>
              <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-foam" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {pictured.length === 0 ? (
                <p className="text-sm text-muted">The basket is empty. The shop is full of soft things.</p>
              ) : (
                pictured.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <Link href={`/product/${item.slug}`} onClick={() => setOpen(false)} className="w-20 shrink-0 overflow-hidden rounded-2xl border border-line bg-white">
                      <BasketPhoto item={item} />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-ink">{item.name}</p>
                      <p className="text-sm text-muted">{formatRs(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label="Decrease" onClick={() => value.setQty(item.productId, item.qty - 1)}>
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm">{item.qty}</span>
                        <button className="grid h-8 w-8 place-items-center rounded-full border border-line" aria-label="Increase" onClick={() => value.setQty(item.productId, Math.min(5, item.qty + 1))}>
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button className="ml-auto text-xs text-muted underline" onClick={() => value.remove(item.productId)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-line px-5 py-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span>{formatRs(subtotal)}</span>
              </div>
              <div className="grid gap-2">
                <Link href="/cart" onClick={() => setOpen(false)} className={buttonClass("ghost")}>
                  View basket
                </Link>
                <Link href="/checkout" onClick={() => setOpen(false)} className={buttonClass("solid", pictured.length === 0 ? "pointer-events-none opacity-50" : "")}>
                  Checkout
                </Link>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}
