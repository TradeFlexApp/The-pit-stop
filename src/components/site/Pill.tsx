import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

type Tone = "dark" | "light" | "outline" | "brand" | "ghost";

const tones: Record<Tone, string> = {
  dark: "bg-ink text-white hover:bg-ink-soft",
  light: "bg-mist text-ink hover:bg-steel",
  outline: "border border-line bg-white text-ink hover:bg-mist",
  brand: "bg-brand text-ink hover:bg-brand-deep",
  ghost: "border border-white/20 bg-white/5 text-white hover:bg-white/10",
};

export function Pill({
  href,
  tone = "dark",
  chevron = false,
  full = false,
  disabled = false,
  size = "md",
  className,
  children,
  ariaLabel,
}: {
  href?: string;
  tone?: Tone;
  chevron?: boolean;
  full?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
}) {
  const cls = clsx(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors",
    size === "sm" && "h-10 px-5 text-sm",
    size === "md" && "h-12 px-6 text-[15px]",
    size === "lg" && "h-14 px-8 text-base",
    tones[tone],
    full && "w-full",
    disabled && "pointer-events-none opacity-60",
    className
  );
  const inner = (
    <>
      {children}
      {chevron && <ChevronRight className="size-4" aria-hidden="true" />}
    </>
  );
  if (!href || disabled) {
    return (
      <span className={cls} aria-disabled={disabled || undefined} aria-label={ariaLabel}>
        {inner}
      </span>
    );
  }
  if (/^(https?:|tel:|mailto:)/.test(href)) {
    const external = href.startsWith("http");
    return (
      <a className={cls} href={href} aria-label={ariaLabel} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <Link className={cls} href={href} aria-label={ariaLabel}>
      {inner}
    </Link>
  );
}
