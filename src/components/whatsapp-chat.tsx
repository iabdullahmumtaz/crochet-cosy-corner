import { MessageCircle } from "lucide-react";

export function WhatsAppChat({ number }: { number: string }) {
  const ready = /^[0-9]{10,15}$/.test(number);
  if (!ready) return null;
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Hi Crochet Cosy Corner, I have a question.")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Message on WhatsApp"
      className="fixed right-4 bottom-4 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_16px_30px_-12px_rgba(37,211,102,0.8)] sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
