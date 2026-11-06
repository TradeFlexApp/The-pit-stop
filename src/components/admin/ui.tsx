import Link from "next/link";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";

const control = "mt-1 block w-full rounded-lg border border-line bg-white px-3 text-[15px] text-ink outline-none focus:border-ink disabled:bg-mist";

export function Card({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx("rounded-2xl border border-line bg-white p-5 md:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && <h2 className="display text-3xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={clsx("block text-sm", className)}>
      <span className="font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(control, "h-11", className)} />;
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={clsx(control, "min-h-24 py-2", className)} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={clsx(control, "h-11", className)}>
      {children}
    </select>
  );
}

export function Checkbox({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={clsx("inline-flex items-center gap-2 text-sm", className)}>
      <input type="checkbox" {...props} className="size-4 accent-ink" />
      {label}
    </label>
  );
}

export function Button({ tone = "dark", className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "dark" | "light" | "danger" | "brand" }) {
  const tones = {
    dark: "bg-ink text-white hover:bg-ink-soft",
    light: "border border-line bg-white text-ink hover:bg-mist",
    danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
    brand: "bg-brand text-ink hover:bg-brand-deep",
  };
  return <button {...props} className={clsx("inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-50", tones[tone], className)} />;
}

export function LinkButton({ href, tone = "light", children, className }: { href: string; tone?: "dark" | "light"; children: ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors",
        tone === "dark" ? "bg-ink text-white hover:bg-ink-soft" : "border border-line bg-white text-ink hover:bg-mist",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** Flash messages driven by ?ok=1 / ?error=... after a server action redirect. */
export function Notice({ ok, error }: { ok?: string; error?: string }) {
  if (error) return <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (ok) return <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">Saved. The website is updated.</p>;
  return null;
}

export function dollars(cents: number | null | undefined): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
