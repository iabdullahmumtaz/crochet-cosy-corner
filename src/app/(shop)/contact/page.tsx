import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-xl px-5 py-12">
      <h1 className="font-display text-5xl text-cocoa">Contact</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
        Custom colours, a kit question, or a note about an order. Messages land in the studio inbox.
      </p>
      <div className="rounded-[28px] border border-line bg-white p-6">
        <ContactForm />
      </div>
    </div>
  );
}
