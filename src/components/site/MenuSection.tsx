import Image from "next/image";
import type { MenuCategoryView, MenuItemView, TierInfo } from "@/data/types";
import { formatPrice } from "@/lib/format";

function Prices({ item }: { item: MenuItemView }) {
  if (!item.tiers.length) return <span className="display text-2xl">{formatPrice(item.price_cents)}</span>;
  return (
    <span className="flex gap-4">
      {item.tiers.map((t) => (
        <span key={t.code} className="flex flex-col items-end leading-none">
          <span className="text-[11px] font-bold tracking-wider text-muted">{t.code}</span>
          <span className="display text-2xl">{formatPrice(t.price_cents)}</span>
        </span>
      ))}
    </span>
  );
}

function Item({ item }: { item: MenuItemView }) {
  return (
    <li id={`menu-${item.slug}`} className="flex gap-4 rounded-2xl border border-line/70 bg-white p-4 scroll-mt-28">
      {item.image_url ? (
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-mist">
          <Image src={item.image_url} alt={item.name} fill sizes="96px" className="object-cover" />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-lg font-semibold">{item.name}</h4>
          {item.badge && <span className="rounded-full bg-brand px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink">{item.badge}</span>}
          {!item.is_available && <span className="rounded-full bg-steel px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-graphite">Sold out</span>}
        </div>
        {item.description && <p className="mt-1 text-sm leading-relaxed text-graphite">{item.description}</p>}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <Prices item={item} />
          {item.allergens.length > 0 && <span className="text-xs text-muted">Contains: {item.allergens.join(", ")}</span>}
        </div>
      </div>
    </li>
  );
}

export function MenuSection({ categories, tiers }: { categories: MenuCategoryView[]; tiers: TierInfo[] }) {
  return (
    <section id="menu" className="bg-paper py-16 md:py-24" aria-labelledby="menu-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="menu-heading" className="display text-6xl md:text-8xl">
              The menu
            </h2>
            <p className="mt-3 max-w-xl text-graphite">Prices in CAD. Burgers come in three engine sizes; everything else is one size.</p>
          </div>
          <ul className="flex gap-2" aria-label="Burger sizes">
            {tiers.map((t) => (
              <li key={t.code} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold">
                <span className="text-brand-deep">{t.code}</span> {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 space-y-14">
          {categories.map((c) => (
            <div key={c.id} id={c.slug === "breakfast" ? "breakfast" : `menu-cat-${c.slug}`} className="scroll-mt-28">
              <div className="mb-5 border-b border-line pb-4">
                <h3 className="display text-4xl md:text-5xl">{c.name}</h3>
                {c.description && <p className="mt-1 text-graphite">{c.description}</p>}
              </div>
              <ul className="grid gap-3 md:grid-cols-2">
                {c.items.map((item) => (
                  <Item key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Our kitchen shares equipment. Please tell us about any allergy when you order.
        </p>
      </div>
    </section>
  );
}
