"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { Wordmark } from "./Wordmark";
import { Pill } from "./Pill";

const NAV = [
  { label: "Menu", href: "/#menu" },
  { label: "Breakfast", href: "/#breakfast" },
  { label: "Engine sizes", href: "/#sizes" },
  { label: "Location", href: "/#location" },
  { label: "FAQ", href: "/#faq" },
];

export function Header({ solid = false }: { solid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dark = solid || scrolled || open;

  return (
    <header className={clsx("fixed inset-x-0 top-0 z-50 transition-colors duration-300", dark ? "bg-ink/95 backdrop-blur" : "bg-transparent")}>
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-4 md:h-20 md:grid-cols-[auto_1fr_auto] md:px-8">
        <button
          type="button"
          className="order-1 justify-self-start text-white md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-7" /> : <Menu className="size-7" />}
        </button>

        <Link href="/" className="order-2 justify-self-center md:order-1 md:justify-self-start" aria-label="The Pit Stop home">
          <Wordmark className="text-3xl md:text-4xl" />
        </Link>

        <nav className="hidden md:order-2 md:flex md:justify-center md:gap-8" aria-label="Primary">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-semibold text-white transition-colors hover:text-brand">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="order-3 justify-self-end">
          <Pill href="/#order" tone="light" size="sm">
            Order
          </Pill>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-white/10 bg-ink px-6 py-5 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)} className="display block py-2 text-3xl text-white hover:text-brand">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
