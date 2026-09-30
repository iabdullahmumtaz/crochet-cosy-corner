import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { requireRole } from "@/lib/auth";
import { readStore } from "@/lib/db";

export const metadata: Metadata = {
  title: "Studio desk",
  robots: { index: false, follow: false },
};

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("admin");
  if (!user) redirect("/admin/login");
  const store = await readStore();
  const unread = store.messages.filter((message) => !message.read).length;
  return (
    <AdminShell name={user.name} unread={unread}>
      {children}
    </AdminShell>
  );
}
