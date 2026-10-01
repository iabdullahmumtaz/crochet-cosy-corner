import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { CartProvider } from "@/components/cart-provider";
import { readStore } from "@/lib/db";
import { themeId } from "@/lib/themes";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Crochet Cosy Corner",
    template: "%s · Crochet Cosy Corner",
  },
  description: "Amigurumi, wearables, crochet flowers, and bags made slowly in small batches.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const store = await readStore();
  const photos = store.products.map((product) => ({
    id: product.id,
    slug: product.slug,
    imageUrl: product.imageUrl,
  }));
  return (
    <html lang="en" data-theme={themeId(store.theme)} data-scroll-behavior="smooth" className={`${manrope.variable} ${bodoni.variable} h-full antialiased`}>
      <body className="min-h-full">
        <CartProvider photos={photos}>{children}</CartProvider>
      </body>
    </html>
  );
}
