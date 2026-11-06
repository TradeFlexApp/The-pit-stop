import Link from "next/link";
import type { SiteContent } from "@/data/types";
import { Wordmark } from "./Wordmark";
import { Year } from "./Year";

const NAV = [
  { label: "Menu", href: "/menu" },
  { label: "Breakfast", href: "/menu#breakfast" },
  { label: "Engine sizes", href: "/#sizes" },
  { label: "Location & hours", href: "/#location" },
  { label: "Order & delivery", href: "/#order" },
  { label: "FAQ", href: "/#faq" },
];

export function Footer({ content }: { content: SiteContent }) {
  const { location, categories } = content;
  const socials = [
    { label: "Instagram", href: location.instagram_url },
    { label: "Facebook", href: location.facebook_url },
    { label: "TikTok", href: location.tiktok_url },
  ].filter((s) => s.href);
  const groups = [
    { label: "Food", slugs: ["smash-burgers", "chicken", "sides", "kids"] },
    { label: "Breakfast", slugs: ["breakfast"] },
    { label: "Shakes & drinks", slugs: ["shakes", "drinks"] },
  ];

  return (
    <footer className="bg-mist pb-28 pt-12 md:pb-12">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Link href="/" aria-label="The Pit Stop home" className="inline-block">
          <Wordmark className="text-[17vw] leading-none md:text-9xl" />
        </Link>

        <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1fr_1.2fr]">
          <nav aria-label="Footer">
            <ul className="text-lg">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="inline-block py-2 hover:underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
            {socials.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-4">
                {socials.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href!} target="_blank" rel="noopener noreferrer" className="inline-block py-2 font-semibold text-graphite hover:text-ink">
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </nav>

          <div className="text-[15px] text-graphite">
            <p className="font-semibold text-ink">{location.name}</p>
            <p className="mt-2">
              {location.address_line1}
              <br />
              {location.city}, {location.region} {location.postal_code}
            </p>
            {location.landmark && <p className="mt-1">{location.landmark}</p>}
            {location.phone && <p className="mt-2">{location.phone}</p>}
            {location.email && <p>{location.email}</p>}
          </div>

          <div className="divide-y divide-line border-y border-line">
            {groups.map((g) => {
              const items = categories.filter((c) => g.slugs.includes(c.slug)).flatMap((c) => c.items);
              if (!items.length) return null;
              return (
                <details key={g.label} className="group py-3">
                  <summary className="flex min-h-11 cursor-pointer items-center justify-between text-lg">
                    {g.label}
                    <span className="text-muted transition-transform group-open:rotate-180" aria-hidden="true">
                      ⌄
                    </span>
                  </summary>
                  <ul className="mt-2 grid grid-cols-2 gap-x-4 text-sm text-graphite">
                    {items.map((i) => (
                      <li key={i.id}>
                        <Link href={`/menu#menu-${i.slug}`} className="inline-block py-1.5 hover:underline">
                          {i.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>© <Year /> The Pit Stop. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <span>Smashed in Fort McMurray, Alberta.</span>
            <Link href="/admin" className="inline-block py-2 text-xs text-muted/80 hover:underline">
              Admin
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
