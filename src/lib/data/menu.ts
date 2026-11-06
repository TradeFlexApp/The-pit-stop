import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BusinessHours, Location, MenuCategory, MenuItem, Promotion } from "@/types/database";

export type MenuCategoryWithItems = MenuCategory & { items: MenuItem[] };
export type LocationWithHours = Location & { hours: BusinessHours[] };

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Active categories with their items, both in display order. */
export async function getMenu(): Promise<MenuCategoryWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_categories")
    .select("*, menu_items(*)")
    .eq("is_active", true)
    .order("sort_order")
    .order("sort_order", { referencedTable: "menu_items" });
  if (error) throw new Error(`Failed to load menu: ${error.message}`);

  const rows = (data ?? []) as Array<MenuCategory & { menu_items: MenuItem[] | null }>;
  return rows.map(({ menu_items, ...category }) => ({ ...category, items: menu_items ?? [] }));
}

export async function getFeaturedItems(limit = 4): Promise<MenuItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_featured", true)
    .eq("is_available", true)
    .order("sort_order")
    .limit(limit);
  if (error) throw new Error(`Failed to load featured items: ${error.message}`);
  return data ?? [];
}

/** The primary location with its weekly hours (sorted Sunday..Saturday). */
export async function getPrimaryLocation(): Promise<LocationWithHours | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*, business_hours(*)")
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load location: ${error.message}`);
  if (!data) return null;
  const { business_hours, ...location } = data as Location & { business_hours: BusinessHours[] | null };
  const hours = [...(business_hours ?? [])].sort((a, b) => a.day_of_week - b.day_of_week);
  return { ...location, hours };
}

/** Promotions that are active right now (the RLS policy already filters by date window). */
export async function getActivePromotions(): Promise<Promotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("promotions").select("*").order("sort_order");
  if (error) throw new Error(`Failed to load promotions: ${error.message}`);
  return data ?? [];
}

export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatTime(t: string | null): string {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour12}:${String(m).padStart(2, "0")} ${suffix}` : `${hour12} ${suffix}`;
}

/** Plain-text snapshot of the menu + hours, used as grounding context for the Gemini assistant. */
export function formatMenuForPrompt(menu: MenuCategoryWithItems[], location: LocationWithHours | null): string {
  const lines: string[] = [];
  if (location) {
    lines.push(`LOCATION: ${location.name}, ${location.address_line1}, ${location.city}, ${location.region} ${location.postal_code}.`);
    if (location.phone) lines.push(`PHONE: ${location.phone}`);
    if (location.hours.length) {
      lines.push("HOURS:");
      for (const h of location.hours) {
        lines.push(`- ${DAY_NAMES[h.day_of_week]}: ${h.is_closed ? "Closed" : `${formatTime(h.opens_at)} - ${formatTime(h.closes_at)}`}`);
      }
    }
    lines.push("");
  }
  lines.push("MENU:");
  for (const category of menu) {
    lines.push(`## ${category.name}${category.description ? ` - ${category.description}` : ""}`);
    for (const item of category.items) {
      const flags = [
        !item.is_available ? "SOLD OUT" : null,
        ...item.tags,
        item.allergens.length ? `contains: ${item.allergens.join(", ")}` : null,
        item.calories ? `${item.calories} cal` : null,
      ].filter(Boolean);
      lines.push(`- ${item.name} (${formatPrice(item.price_cents)})${item.description ? `: ${item.description}` : ""}${flags.length ? ` [${flags.join("; ")}]` : ""}`);
    }
  }
  return lines.join("\n");
}
