"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function CardPhoto({
  src,
  alt = "",
  className,
  eager = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  eager?: boolean;
}) {
  const [ready, setReady] = useState(false);

  return (
    <span className={cn("relative block overflow-hidden bg-foam", className)}>
      {ready ? null : <span className="bone absolute inset-0" aria-hidden />}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        onLoad={() => setReady(true)}
        className={cn("h-full w-full object-cover transition-opacity duration-300", ready ? "opacity-100" : "opacity-0")}
      />
    </span>
  );
}
