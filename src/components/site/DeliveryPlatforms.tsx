import { clsx } from "clsx";
import type { LocationView } from "@/data/types";
import { telHref } from "@/lib/format";
import { Pill } from "./Pill";

/**
 * Ordering platform block. Each delivery app lights up the moment its URL is set
 * (Supabase `locations.doordash_url` / `skipthedishes_url`, or src/data/menu.json);
 * until then it shows as "coming soon".
 */
export function DeliveryPlatforms({ location }: { location: LocationView }) {
  const tel = telHref(location.phone);
  const platforms = [
    { name: "SkipTheDishes", url: location.skipthedishes_url, color: "bg-skip" },
    { name: "DoorDash", url: location.doordash_url, color: "bg-doordash" },
  ];
  const anyLive = platforms.some((p) => p.url);

  return (
    <section id="order" className="bg-ink py-16 text-white md:py-24" aria-labelledby="order-heading">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-brand">Pickup &amp; delivery</p>
        <h2 id="order-heading" className="display text-5xl md:text-7xl">
          Order your way
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-white/80">
          {anyLive
            ? "Order for delivery through the apps below, or call ahead and pick it up hot."
            : "Call ahead and it's boxed when you pull in. SkipTheDishes and DoorDash are on the way: the buttons below go live the day we're listed."}
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <h3 className="display text-3xl">Order ahead</h3>
            <p className="mt-2 text-white/70">Call it in, pick it up. Ready in minutes.</p>
            <div className="mt-6">
              {location.online_order_url ? (
                <Pill href={location.online_order_url} tone="brand" full chevron>
                  Order online
                </Pill>
              ) : tel ? (
                <Pill href={tel} tone="brand" full>
                  Call {location.phone}
                </Pill>
              ) : (
                <Pill tone="brand" full disabled>
                  Phone number coming soon
                </Pill>
              )}
            </div>
          </div>

          {platforms.map((p) => (
            <div key={p.name} className="rounded-3xl border border-white/10 bg-white/5 p-7">
              <div className="flex items-center justify-between gap-3">
                <h3 className="display text-3xl">{p.name}</h3>
                {!p.url && <span className="rounded-full border border-brand/60 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand">Coming soon</span>}
              </div>
              <p className="mt-2 text-white/70">{p.url ? `Delivered to your door by ${p.name}.` : `We're getting set up on ${p.name}.`}</p>
              <div className="mt-6">
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx("inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-[15px] font-semibold text-white transition-opacity hover:opacity-90", p.color)}
                  >
                    Order on {p.name}
                  </a>
                ) : (
                  <Pill tone="ghost" full disabled>
                    Order on {p.name}
                  </Pill>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
