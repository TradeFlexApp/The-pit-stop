import Image from "next/image";
import Link from "next/link";
import type { PromotionView } from "@/data/types";

/** Live specials from the admin (or the bundled content), shown as a yellow band under the hero. */
export function PromoStrip({ promotions }: { promotions: PromotionView[] }) {
  if (!promotions.length) return null;
  return (
    <section className="bg-brand text-ink" aria-label="Specials">
      <div className="mx-auto max-w-7xl px-5 py-4 md:px-8">
        <ul className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-10">
          {promotions.map((p, i) => {
            const cta =
              p.cta_label && p.cta_url ? (
                p.cta_url.startsWith("http") ? (
                  <a href={p.cta_url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white">
                    {p.cta_label}
                  </a>
                ) : (
                  <Link href={p.cta_url} className="inline-flex h-10 shrink-0 items-center rounded-full bg-ink px-4 text-sm font-semibold text-white">
                    {p.cta_label}
                  </Link>
                )
              ) : null;
            return (
              <li key={`${p.title}-${i}`} className="flex items-center gap-4">
                {p.image_url && (
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-lg">
                    <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                )}
                <div className="min-w-0">
                  <p className="display text-2xl leading-none">{p.title}</p>
                  {p.body && <p className="mt-1 text-sm text-ink/80">{p.body}</p>}
                </div>
                <div className="ml-auto">{cta}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
