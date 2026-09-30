export function HeroStill() {
  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-xl">
      <div className="absolute inset-x-6 bottom-0 top-8 overflow-hidden rounded-[36px] bg-[#efe4d4]">
        <div className="yarn-ball absolute -left-8 top-8 h-40 w-40 rounded-full" style={{ ["--yarn" as string]: "#b7c4a0" }} />
        <div className="yarn-ball absolute -right-6 -top-4 h-48 w-48 rounded-full" style={{ ["--yarn" as string]: "#d5ddd0" }} />
        <div className="yarn-ball absolute bottom-6 left-10 h-36 w-36 rounded-full" style={{ ["--yarn" as string]: "#e7b7b4" }} />
        <div className="yarn-ball absolute right-8 bottom-2 h-28 w-28 rounded-full" style={{ ["--yarn" as string]: "#c96b62" }} />
        <div className="yarn-ball absolute top-24 left-24 h-24 w-24 rounded-full" style={{ ["--yarn" as string]: "#f3e2b0" }} />
        <svg viewBox="0 0 80 90" className="absolute bottom-8 left-6 h-24 w-20" aria-hidden>
          <ellipse cx="28" cy="18" rx="7" ry="16" fill="#f7f1e8" />
          <ellipse cx="48" cy="18" rx="7" ry="16" fill="#f7f1e8" />
          <ellipse cx="28" cy="20" rx="3" ry="9" fill="#f3c1cc" />
          <ellipse cx="48" cy="20" rx="3" ry="9" fill="#f3c1cc" />
          <ellipse cx="38" cy="52" rx="22" ry="24" fill="#f7f1e8" />
          <circle cx="31" cy="48" r="1.6" fill="#5c3b2e" />
          <circle cx="45" cy="48" r="1.6" fill="#5c3b2e" />
          <path d="M34 58c3 3 8 3 10 0" stroke="#5c3b2e" strokeWidth="1.4" fill="none" />
        </svg>
      </div>
      <div className="notepad absolute top-2 right-0 w-[58%] rotate-3 rounded-[22px] border border-[#e4d8c8] px-5 py-6 shadow-[0_18px_40px_-24px_rgba(80,50,30,0.45)]">
        <p className="font-script text-5xl leading-none text-sage sm:text-6xl">shop</p>
        <p className="font-display text-4xl leading-none text-cocoa sm:text-5xl">is live</p>
        <svg viewBox="0 0 120 36" className="mt-3 h-8 w-28" aria-hidden>
          <circle cx="18" cy="18" r="8" fill="#c45c55" />
          <path d="M18 12c2 3 2 6 0 8" stroke="#6d8548" strokeWidth="2" fill="none" />
          <path d="M48 20l6-12 6 12" stroke="#e2b33c" strokeWidth="3" fill="none" strokeLinejoin="round" />
          <circle cx="92" cy="16" r="7" fill="#7cae4a" />
        </svg>
      </div>
      <svg viewBox="0 0 80 50" className="absolute right-2 bottom-4 h-14 w-20" aria-hidden>
        <defs>
          <pattern id="gingham" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#f4f7ec" />
            <rect width="4" height="4" fill="#6d8548" />
            <rect x="4" y="4" width="4" height="4" fill="#6d8548" />
          </pattern>
        </defs>
        <path d="M8 20c10-16 24-16 28 0-8 4-20 4-28 0z" fill="url(#gingham)" />
        <path d="M44 20c8-16 24-14 28 2-10 4-20 2-28-2z" fill="url(#gingham)" />
        <circle cx="40" cy="22" r="5" fill="#4f6b32" />
        <path d="M34 24l-8 16M46 24l8 16" stroke="#6d8548" strokeWidth="6" strokeLinecap="round" />
      </svg>
    </div>
  );
}
