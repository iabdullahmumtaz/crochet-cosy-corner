import { Suspense } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { WhatsAppChat } from "@/components/whatsapp-chat";
import { getCurrentUser } from "@/lib/auth";
import { readStore } from "@/lib/db";

async function ShopHeader() {
  const user = await getCurrentUser();
  const store = await readStore();
  return <Header user={user} categories={store.categories ?? []} />;
}

async function ShopWhatsApp() {
  const store = await readStore();
  return <WhatsAppChat number={store.whatsapp ?? ""} />;
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <div className="bg-foam text-center text-[12px] tracking-[0.04em] text-cocoa sm:text-[13px]">
        <p className="px-4 py-2.5">
          Free delivery over Rs5,000
          <span className="mx-2 text-brass">/</span>
          <Link href="/track" className="underline decoration-petal underline-offset-4">Track an order</Link>
        </p>
      </div>
      <Suspense fallback={<div className="h-[4.25rem] border-b border-line bg-white" />}>
        <ShopHeader />
      </Suspense>
      <main id="main" className="flex-1">{children}</main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <ShopWhatsApp />
      </Suspense>
    </div>
  );
}
