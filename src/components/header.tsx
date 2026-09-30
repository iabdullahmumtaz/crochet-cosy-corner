"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useCart } from "@/components/cart-provider";
import type { PublicUser, ShopCategory } from "@/lib/types";

export function Header({ user, categories }: { user: PublicUser | null; categories: ShopCategory[] }) {
  const { count, setOpen, ready } = useCart();
  const [menu, setMenu] = useState(false);
  const accountHref = user?.role === "admin" ? "/admin" : user ? "/account" : "/login";
  const accountLabel = user?.role === "admin" ? "Desk" : user ? "Account" : "Sign in";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-[4.25rem] max-w-6xl items-center gap-3 px-4 py-2 sm:gap-4 sm:px-5">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {categories.slice(0, 5).map((category) => (
            <Link key={category.id} href={`/shop?category=${category.id}`} className="rounded-full px-3 py-1.5 text-[13px] text-bark transition hover:bg-white hover:text-ink">
              {category.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <form action="/shop" className="relative hidden md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              aria-label="Search pieces"
              placeholder="Search"
              className="h-10 w-40 rounded-full border border-line bg-white pr-3 pl-9 text-sm outline-none transition focus:border-ink/30 lg:w-48"
            />
          </form>
          <Link href={accountHref} className="hidden h-10 items-center rounded-full px-3 text-sm text-bark transition hover:bg-white sm:inline-flex">
            {accountLabel}
          </Link>
          <button
            type="button"
            className="relative grid h-10 w-10 place-items-center rounded-full transition hover:bg-white"
            aria-label="Open basket"
            onClick={() => setOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {ready && count > 0 ? (
              <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-sage px-1 text-[10px] font-medium text-white">
                {count}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-white lg:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            onClick={() => setMenu((value) => !value)}
          >
            {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {menu ? (
        <div className="border-t border-line bg-sand px-5 py-4 lg:hidden">
          <form action="/shop" className="mb-3">
            <input name="q" aria-label="Search pieces" placeholder="Search" className="h-11 w-full rounded-full border border-line bg-white px-4 text-sm" />
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link key={category.id} href={`/shop?category=${category.id}`} onClick={() => setMenu(false)} className="rounded-full bg-white px-3 py-1.5 text-sm">
                {category.label}
              </Link>
            ))}
            <Link href="/track" onClick={() => setMenu(false)} className="rounded-full bg-white px-3 py-1.5 text-sm">Track</Link>
            <Link href={accountHref} onClick={() => setMenu(false)} className="rounded-full bg-white px-3 py-1.5 text-sm">{accountLabel}</Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
