"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderOpen, Inbox, LayoutDashboard, LogOut, Menu, Package, Settings, Store, Tag, Truck, Users, X } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/actions/auth";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/cn";

const links = [
  { href: "/admin", label: "Desk", icon: LayoutDashboard },
  { href: "/admin/products", label: "Pieces", icon: Package },
  { href: "/admin/categories", label: "Collections", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: Truck },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  name,
  unread,
  children,
}: {
  name: string;
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="grid gap-1">
      {links.map((link) => {
        const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm",
              active ? "bg-foam text-sage-deep" : "text-bark hover:bg-foam",
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
            {link.href === "/admin/inbox" && unread > 0 ? (
              <span className="ml-auto rounded-full bg-[#f6e7c1] px-2 text-xs text-bark">{unread}</span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-sand text-ink">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-white px-4 py-6 text-ink md:flex">
        <Logo href="/admin" caption="studio desk" />
        <div className="mt-8">{nav}</div>
        <div className="mt-auto grid gap-2">
          <Link href="/" className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-bark hover:bg-foam">
            <Store className="h-4 w-4" />
            Back to shop
          </Link>
          <button
            className="flex items-center gap-2 rounded-full px-4 py-2 text-left text-sm text-bark hover:bg-foam"
            onClick={async () => {
              await logout();
              toast.success("Signed out");
              router.push("/admin/login");
              router.refresh();
            }}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <p className="px-4 text-xs text-muted">{name}</p>
        </div>
      </aside>
      <div className="md:pl-64">
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
          <Logo />
          <button className="grid h-10 w-10 place-items-center" aria-label="Open desk menu" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
        {open ? (
          <div className="fixed inset-0 z-40 md:hidden">
            <button className="absolute inset-0 bg-ink/40" aria-label="Close menu" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-line bg-white p-5 text-ink">
              <div className="mb-6 flex items-center justify-between">
                <Logo href="/admin" caption="studio desk" />
                <button aria-label="Close" onClick={() => setOpen(false)}><X /></button>
              </div>
              {nav}
            </div>
          </div>
        ) : null}
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
