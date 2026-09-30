import Link from "next/link";
import { Logo } from "@/components/logo";
import { NewsletterForm } from "@/components/newsletter-form";
import { readStore } from "@/lib/db";

export async function Footer() {
  const store = await readStore();
  const categories = store.categories ?? [];

  return (
    <footer className="mt-16 border-t border-line bg-white text-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
            Amigurumi, wearables, flowers, and bags, hooked in small batches after you order.
          </p>
        </div>
        <div>
          <h2 className="text-[11px] tracking-[0.22em] text-sage-deep uppercase">Collections</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={`/shop?category=${category.id}`} className="transition hover:text-sage-deep">{category.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-[11px] tracking-[0.22em] text-sage-deep uppercase">Help</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/track" className="transition hover:text-sage-deep">Track an order</Link></li>
            <li><Link href="/faq" className="transition hover:text-sage-deep">Questions</Link></li>
            <li><Link href="/delivery" className="transition hover:text-sage-deep">Delivery and returns</Link></li>
            <li><Link href="/account" className="transition hover:text-sage-deep">Your account</Link></li>
            <li><Link href="/keepsakes" className="transition hover:text-sage-deep">Keepsakes</Link></li>
            <li><Link href="/contact" className="transition hover:text-sage-deep">Contact</Link></li>
          </ul>
        </div>
        <div className="min-w-0">
          <h2 className="text-[11px] tracking-[0.22em] text-sage-deep uppercase">Studio notes</h2>
          <p className="mt-4 mb-4 text-sm leading-6 text-muted">New pieces and shop pauses.</p>
          <NewsletterForm />
          <p className="mt-5 text-xs text-muted">
            <Link href="/privacy" className="underline decoration-petal underline-offset-4">Privacy</Link>
            {" · "}
            <Link href="/terms" className="underline decoration-petal underline-offset-4">Terms</Link>
            {" · "}
            <Link href="/admin/login" className="underline decoration-petal underline-offset-4">Desk</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
