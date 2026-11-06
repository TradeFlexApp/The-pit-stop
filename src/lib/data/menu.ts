import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { createPublicClient } from "@/lib/supabase/public";
import { staticContent } from "@/data/static";
import { dayName, formatPrice, formatTime } from "@/lib/format";
import type { HoursView, LocationView, MenuCategoryView, MenuItemView, MenuTierView, SiteContent, TierCode } from "@/data/types";
import type { BusinessHours, Location, MenuCategory, MenuItem, MenuItemTier, Promotion } from "@/types/database";

/**
 * Everything the site needs to render. Reads Supabase when it is configured,
 * otherwise (or if the database errors) serves the bundled static content so
 * the site never renders empty.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("hours");
  cacheTag("site-content");
  if (!hasPublicSupabaseEnv()) return staticContent;
  try {
    return await loadFromSupabase();
  } catch (err) {
    console.warn("[content] Supabase unavailable, serving static content:", err instanceof Error ? err.message : err);
    return staticContent;
  }
}

async function loadFromSupabase(): Promise<SiteContent> {
  const supabase = createPublicClient();
  const [categoriesRes, locationRes, promotionsRes] = await Promise.all([
    supabase
      .from("menu_categories")
      .select("*, menu_items(*, menu_item_tiers(*))")
      .eq("is_active", true)
      .order("sort_order")
      .order("sort_order", { referencedTable: "menu_items" }),
    supabase.from("locations").select("*, business_hours(*)").eq("is_primary", true).limit(1).maybeSingle(),
    supabase.from("promotions").select("*").order("sort_order"),
  ]);
  if (categoriesRes.error) throw new Error(categoriesRes.error.message);
  if (locationRes.error) throw new Error(locationRes.error.message);
  if (promotionsRes.error) throw new Error(promotionsRes.error.message);

  const categoryRows = (categoriesRes.data ?? []) as Array<MenuCategory & { menu_items: Array<MenuItem & { menu_item_tiers: MenuItemTier[] | null }> | null }>;
  const categories: MenuCategoryView[] = categoryRows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sort_order: c.sort_order,
    items: (c.menu_items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item): MenuItemView => ({
        id: item.id,
        slug: item.slug,
        name: item.name,
        description: item.description,
        price_cents: item.price_cents,
        image_url: item.image_url ?? staticImageFor(item.slug),
        calories: item.calories,
        tags: item.tags,
        allergens: item.allergens,
        badge: item.badge,
        is_available: item.is_available,
        is_featured: item.is_featured,
        sort_order: item.sort_order,
        tiers: (item.menu_item_tiers ?? [])
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((t): MenuTierView => ({ code: t.code as TierCode, label: t.label, price_cents: t.price_cents, sort_order: t.sort_order })),
      })),
  }));

  const locationRow = locationRes.data as (Location & { business_hours: BusinessHours[] | null }) | null;
  const location: LocationView = locationRow
    ? {
        name: locationRow.name,
        address_line1: locationRow.address_line1,
        address_line2: locationRow.address_line2,
        city: locationRow.city,
        region: locationRow.region,
        postal_code: locationRow.postal_code,
        country: locationRow.country,
        phone: locationRow.phone,
        email: locationRow.email,
        landmark: locationRow.landmark,
        timezone: locationRow.timezone,
        google_maps_url: locationRow.google_maps_url,
        doordash_url: locationRow.doordash_url,
        skipthedishes_url: locationRow.skipthedishes_url,
        online_order_url: locationRow.online_order_url,
        instagram_url: locationRow.instagram_url,
        tiktok_url: locationRow.tiktok_url,
        facebook_url: locationRow.facebook_url,
        hours: (locationRow.business_hours ?? [])
          .slice()
          .sort((a, b) => a.day_of_week - b.day_of_week)
          .map((h): HoursView => ({ day_of_week: h.day_of_week, opens_at: h.opens_at, closes_at: h.closes_at, is_closed: h.is_closed })),
      }
    : staticContent.location;

  const promotions = ((promotionsRes.data ?? []) as Promotion[]).map((p) => ({ title: p.title, body: p.body, cta_label: p.cta_label, cta_url: p.cta_url }));

  return {
    location,
    tiers: staticContent.tiers,
    addons: staticContent.addons,
    categories: categories.length ? categories : staticContent.categories,
    promotions,
    faqs: staticContent.faqs,
    value_props: staticContent.value_props,
  };
}

/** Bundled photo for an item when the database row has no image_url yet. */
function staticImageFor(slug: string): string | null {
  for (const c of staticContent.categories) {
    const hit = c.items.find((i) => i.slug === slug);
    if (hit) return hit.image_url;
  }
  return null;
}

export { dayName, formatPrice, formatTime } from "@/lib/format";

/** Plain-text snapshot of the menu + hours, used as grounding context for the Gemini assistant. */
export function formatMenuForPrompt(content: SiteContent): string {
  const { location, categories, tiers } = content;
  const lines: string[] = [];
  lines.push(`RESTAURANT: ${location.name}, ${location.address_line1}, ${location.city}, ${location.region} ${location.postal_code}${location.landmark ? ` (${location.landmark})` : ""}.`);
  if (location.phone) lines.push(`PHONE: ${location.phone}`);
  if (location.hours.length) {
    lines.push("HOURS:");
    for (const h of location.hours) {
      lines.push(`- ${dayName(h.day_of_week)}: ${h.is_closed ? "Closed" : `${formatTime(h.opens_at)} - ${formatTime(h.closes_at)}`}`);
    }
  }
  lines.push(`BURGER SIZES: ${tiers.map((t) => `${t.code} = ${t.label} (${t.blurb})`).join("; ")}.`);
  lines.push("DELIVERY: " + (location.doordash_url || location.skipthedishes_url ? "available through the delivery apps linked on the website." : "SkipTheDishes and DoorDash are coming soon; pickup by phone is available now."));
  lines.push("");
  lines.push("MENU (prices in CAD):");
  for (const category of categories) {
    lines.push(`## ${category.name}${category.description ? ` - ${category.description}` : ""}`);
    for (const item of category.items) {
      const price = item.tiers.length
        ? item.tiers.map((t) => `${t.code} ${formatPrice(t.price_cents)}`).join(" / ")
        : formatPrice(item.price_cents);
      const flags = [
        !item.is_available ? "SOLD OUT" : null,
        ...item.tags,
        item.allergens.length ? `contains: ${item.allergens.join(", ")}` : null,
        item.calories ? `${item.calories} cal` : null,
      ].filter(Boolean);
      lines.push(`- ${item.name} (${price})${item.description ? `: ${item.description}` : ""}${flags.length ? ` [${flags.join("; ")}]` : ""}`);
    }
  }
  return lines.join("\n");
}
