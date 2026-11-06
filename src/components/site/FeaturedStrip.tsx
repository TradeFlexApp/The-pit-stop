import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { MenuItemView } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { Pill } from "./Pill";

function priceLabel(item: MenuItemView) {
  return item.tiers.length ? `from ${formatPrice(item.tiers[0].price_cents)}` : formatPrice(item.price_cents);
}

export function FeaturedStrip({ items }: { items: MenuItemView[] }) {
  if (!items.length) return null;
  return (
    <section className="bg-paper py-10 md:py-14" aria-labelledby="featured-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 id="featured-heading" className="display text-5xl md:text-6xl">
            Featured
          </h2>
          <Pill href="/#menu" tone="outline" chevron>
            View menu
          </Pill>
        </div>

        <ul className="-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li key={item.id} className="w-[72vw] shrink-0 snap-start sm:w-[300px]">
              <Link href={`/#menu-${item.slug}`} className="group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="(min-width: 640px) 300px, 72vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="display absolute inset-0 flex items-center justify-center p-6 text-center text-3xl text-graphite">{item.name}</div>
                  )}
                  <span className="absolute bottom-3 right-3 inline-flex size-11 items-center justify-center rounded-full bg-white text-ink shadow-md" aria-hidden="true">
                    <Plus className="size-5" />
                  </span>
                  {item.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">{item.badge}</span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between gap-3">
                  <span className="font-semibold">{item.name}</span>
                  <span className="text-sm text-graphite">{priceLabel(item)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <Pill href="/#order" tone="dark" full className="md:hidden">
            Order ahead
          </Pill>
        </div>
      </div>
    </section>
  );
}
