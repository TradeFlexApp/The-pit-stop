import raw from "@/data/menu.json";
import type { MenuCategoryView, MenuItemView, MenuTierView, SiteContent, TierCode, TierInfo } from "@/data/types";

/**
 * Static site content built from src/data/menu.json.
 * Used when Supabase is not configured (local dev, first deploy) and as a
 * safety net if the database is unreachable. The same JSON generates
 * supabase/seed.sql (npm run db:seed:gen), so both stay in sync.
 */

type RawItem = (typeof raw.categories)[number]["items"][number] & { image?: string | null };

const tierInfo: TierInfo[] = raw.tiers.map((t) => ({ code: t.code as TierCode, label: t.label, blurb: t.blurb }));

function tiersFor(item: RawItem): MenuTierView[] {
  if (!item.tiers) return [];
  return tierInfo
    .map((t, i) => {
      const price = (item.tiers as Record<string, number>)[t.code];
      return price == null ? null : { code: t.code, label: t.label, price_cents: price, sort_order: i + 1 };
    })
    .filter((t): t is MenuTierView => t !== null);
}

const categories: MenuCategoryView[] = raw.categories.map((c) => ({
  id: c.slug,
  slug: c.slug,
  name: c.name,
  description: c.description ?? null,
  sort_order: c.sort_order,
  items: c.items.map(
    (item): MenuItemView => ({
      id: item.slug,
      slug: item.slug,
      name: item.name,
      description: item.description ?? null,
      price_cents: item.price_cents,
      image_url: (item as RawItem).image ?? null,
      calories: item.calories ?? null,
      tags: item.tags ?? [],
      allergens: item.allergens ?? [],
      badge: item.badge ?? null,
      is_available: true,
      is_featured: item.is_featured ?? false,
      sort_order: item.sort_order,
      tiers: tiersFor(item as RawItem),
    })
  ),
}));

export const staticContent: SiteContent = {
  location: {
    name: raw.location.name,
    address_line1: raw.location.address_line1,
    address_line2: raw.location.address_line2 ?? null,
    city: raw.location.city,
    region: raw.location.region,
    postal_code: raw.location.postal_code,
    country: raw.location.country,
    phone: raw.location.phone ?? null,
    email: raw.location.email ?? null,
    landmark: raw.location.landmark ?? null,
    timezone: raw.location.timezone,
    google_maps_url: raw.location.google_maps_url ?? null,
    doordash_url: raw.location.doordash_url ?? null,
    skipthedishes_url: raw.location.skipthedishes_url ?? null,
    online_order_url: raw.location.online_order_url ?? null,
    instagram_url: raw.location.instagram_url ?? null,
    tiktok_url: raw.location.tiktok_url ?? null,
    facebook_url: raw.location.facebook_url ?? null,
    hours: raw.hours.map((h) => ({ day_of_week: h.day_of_week, opens_at: h.opens_at ?? null, closes_at: h.closes_at ?? null, is_closed: h.is_closed })),
  },
  tiers: tierInfo,
  addons: raw.burger_addons.options.map((o) => ({ name: o.name, price_delta_cents: o.price_delta_cents })),
  categories,
  promotions: raw.promotions.map((p) => ({ title: p.title, body: p.body ?? null, cta_label: p.cta_label ?? null, cta_url: p.cta_url ?? null })),
  faqs: raw.faqs,
  value_props: raw.value_props,
};
