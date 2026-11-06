import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { requireAdmin } from "@/lib/admin/auth";
import { signOut } from "@/lib/admin/actions";
import { Wordmark } from "@/components/site/Wordmark";
import AdminLoading from "../loading";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

const NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Menu", href: "/admin/menu" },
  { label: "Location & hours", href: "/admin/location" },
  { label: "Promotions", href: "/admin/promotions" },
  { label: "Messages", href: "/admin/messages" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
          <Link href="/admin" aria-label="Admin home">
            <Wordmark className="text-3xl" />
          </Link>
          <nav className="flex flex-wrap gap-1 text-sm font-semibold" aria-label="Admin">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-full px-3 py-1.5 hover:bg-mist">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/" target="_blank" rel="noopener" className="font-semibold hover:underline">
              View site ↗
            </Link>
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="rounded-full border border-line px-3 py-1.5 font-semibold hover:bg-mist">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
