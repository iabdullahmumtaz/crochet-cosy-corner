import Link from "next/link";
import { cn } from "@/lib/cn";

export function YarnMark({ className, light = false }: { className?: string; light?: boolean }) {
  const ink = light ? "#f6f1ee" : "#16121a";
  const brass = "#9a7b55";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22.25" fill="none" stroke={ink} strokeWidth="1" />
      <path d="M15 30.5c.4-9 7.2-15 15.2-12.6 4.2 1.2 6.3 4.6 6 8.2" fill="none" stroke={ink} strokeWidth="1.35" strokeLinecap="round" />
      <path d="M17.5 21.5c2.2-6.2 10.4-8.2 15-3.4" fill="none" stroke={brass} strokeWidth="1.15" strokeLinecap="round" />
      <circle cx="30.2" cy="26.2" r="1.15" fill={brass} />
    </svg>
  );
}

export function Logo({
  tone = "shop",
  href = "/",
  caption,
  className,
}: {
  tone?: "shop" | "light";
  href?: string;
  caption?: string;
  className?: string;
}) {
  const light = tone === "light";
  return (
    <Link href={href} className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <YarnMark light={light} className="h-10 w-10 shrink-0" />
      <span className="min-w-0 leading-none">
        <span className={cn("block max-w-[8.6rem] font-display text-[0.95rem] leading-[1.05] tracking-tight sm:max-w-[11rem] sm:text-[1.15rem] lg:max-w-none lg:text-[1.25rem] lg:leading-none", light ? "text-white" : "text-ink")}>
          Crochet Cosy Corner
        </span>
        {caption ? (
          <span className={cn("mt-1 block text-[10px] tracking-[0.22em] uppercase", light ? "text-[#c4a882]" : "text-brass")}>
            {caption}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
