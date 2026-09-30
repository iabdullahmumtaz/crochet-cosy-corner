"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export function WhatsAppChat({ number }: { number: string }) {
  const [open, setOpen] = useState(false);
  const ready = /^[0-9]{10,15}$/.test(number);
  const href = ready
    ? `https://wa.me/${number}?text=${encodeURIComponent("Hi Crochet Cosy Corner, I have a question about an order.")}`
    : "";

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      {open ? (
        <div className="panel mb-3 w-[min(100vw-2rem,20rem)] rounded-3xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl text-cocoa">Studio chat</p>
              <p className="mt-1 text-sm leading-6 text-muted">Opens WhatsApp with a note already written.</p>
            </div>
            <button type="button" aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-foam" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </button>
          </div>
          {ready ? (
            <a href={href} target="_blank" rel="noreferrer" className="mt-4 flex h-11 items-center justify-center rounded-full bg-[#25D366] text-sm font-medium text-white">
              Message on WhatsApp
            </a>
          ) : (
            <p className="mt-4 text-sm text-muted">The studio number is saved from Desk → Settings.</p>
          )}
        </div>
      ) : null}
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close WhatsApp chat" : "Open WhatsApp chat"}
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_16px_30px_-12px_rgba(37,211,102,0.8)]"
        onClick={() => setOpen((value) => !value)}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}
