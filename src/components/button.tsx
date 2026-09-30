import { cn } from "@/lib/cn";

const styles = {
  solid: "bg-sage text-white shadow-[0_12px_28px_-16px_rgba(229,107,138,0.95)] hover:-translate-y-px hover:bg-sage-deep",
  ghost: "border border-line bg-white text-ink hover:border-ink/20 hover:bg-blush",
  quiet: "bg-transparent text-bark hover:bg-white",
  danger: "border border-sale/30 bg-white text-sale hover:bg-blush",
} as const;

export function buttonClass(variant: keyof typeof styles = "solid", className?: string) {
  return cn(
    "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-wide transition disabled:cursor-not-allowed disabled:opacity-50",
    styles[variant],
    className,
  );
}

export function Button({
  variant = "solid",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof styles }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-medium tracking-[0.16em] text-muted uppercase">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition placeholder:text-muted/70 focus:border-ink/40";
