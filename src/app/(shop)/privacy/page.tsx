import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-5xl font-semibold text-ink">Privacy</h1>
      <div className="mt-6 space-y-4 text-sm leading-7 text-muted">
        <p>The studio keeps your name, email, phone, city, and delivery note so an order can be made and sent. Passwords are stored as a hash. Sessions sit in an httpOnly cookie.</p>
        <p>Guest tracking needs the order number and the checkout email. A signed receipt cookie lets the browser that placed the order open it again.</p>
        <p>Newsletter addresses are only for studio notes. Contact messages stay in the desk inbox.</p>
      </div>
    </div>
  );
}
