import Link from "next/link";
import { cn } from "@/lib/cn";

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
      <img src="/logo.png" alt="" className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12" />
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
