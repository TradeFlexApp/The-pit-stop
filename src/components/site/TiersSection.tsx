import type { AddonView, MenuItemView, TierInfo } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { Pill } from "./Pill";

export function TiersSection({ tiers, example, addons }: { tiers: TierInfo[]; example: MenuItemView | undefined; addons: AddonView[] }) {
  return (
    <section id="sizes" className="bg-ink py-16 text-white md:py-24" aria-labelledby="sizes-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">Every burger, three sizes</p>
        <h2 id="sizes-heading" className="display text-5xl md:text-7xl">
          Pick your engine size
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          Same smashed-to-order patties, same toasted bun. The number just tells us how many patties to stack.
          {example ? ` Here's ${example.name} as an example.` : ""}
        </p>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {tiers.map((t) => {
            const price = example?.tiers.find((x) => x.code === t.code)?.price_cents;
            return (
              <li key={t.code} className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <div className="display text-7xl text-brand md:text-8xl">{t.code}</div>
                <div className="display mt-1 text-3xl">{t.label}</div>
                <p className="mt-2 text-white/70">{t.blurb}</p>
                {price != null && <p className="mt-5 text-sm font-semibold text-white/90">{example?.name}: {formatPrice(price)}</p>}
              </li>
            );
          })}
        </ul>

        {addons.length > 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 p-6 md:p-8">
            <h3 className="display text-3xl">Add-ons</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {addons.map((a) => (
                <li key={a.name} className="rounded-full border border-white/15 px-4 py-2 text-sm">
                  {a.name} <span className="text-brand">+{formatPrice(a.price_delta_cents)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8">
          <Pill href="/menu" tone="light" chevron>
            See the full menu
          </Pill>
        </div>
      </div>
    </section>
  );
}
