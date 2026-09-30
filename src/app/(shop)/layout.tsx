import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { getCurrentUser } from "@/lib/auth";
import { readStore } from "@/lib/db";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const store = await readStore();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="bg-foam text-center text-[12px] tracking-[0.04em] text-cocoa sm:text-[13px]">
        <p className="px-4 py-2.5">
          HUG10 · 10% off over Rs1,500
          <span className="mx-2 text-brass">/</span>
          Free delivery over Rs3,000
          <span className="mx-2 text-brass">/</span>
          <Link href="/track" className="underline decoration-petal underline-offset-4">Track an order</Link>
        </p>
      </div>
      <Header user={user} categories={store.categories ?? []} />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <WhatsAppChat number={store.whatsapp ?? ""} />
    </div>
  );
}
