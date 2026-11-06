import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BusinessHours, ContactMessage, Location, MenuCategory, MenuItem, MenuItemTier, Promotion } from "@/types/database";

export type AdminItem = MenuItem & { menu_item_tiers: MenuItemTier[] | null; menu_categories: { name: string } | null };
export type AdminLocation = Location & { business_hours: BusinessHours[] | null };

function must<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export async function adminCategories(): Promise<MenuCategory[]> {
  const admin = createAdminClient();
  return must(await admin.from("menu_categories").select("*").order("sort_order").order("name")) ?? [];
}

export async function adminItems(): Promise<AdminItem[]> {
  const admin = createAdminClient();
  const data = must(await admin.from("menu_items").select("*, menu_item_tiers(*), menu_categories(name)").order("sort_order").order("name"));
  return (data ?? []) as unknown as AdminItem[];
}

export async function adminItem(id: string): Promise<AdminItem | null> {
  const admin = createAdminClient();
  const res = await admin.from("menu_items").select("*, menu_item_tiers(*), menu_categories(name)").eq("id", id).maybeSingle();
  if (res.error?.code === "22P02") return null; // not a uuid
  const data = must(res);
  return (data as unknown as AdminItem | null) ?? null;
}

export async function adminLocation(): Promise<AdminLocation | null> {
  const admin = createAdminClient();
  const data = must(await admin.from("locations").select("*, business_hours(*)").order("is_primary", { ascending: false }).limit(1).maybeSingle());
  return (data as unknown as AdminLocation | null) ?? null;
}

export async function adminPromotions(): Promise<Promotion[]> {
  const admin = createAdminClient();
  return must(await admin.from("promotions").select("*").order("sort_order").order("created_at", { ascending: false })) ?? [];
}

export async function adminMessages(): Promise<ContactMessage[]> {
  const admin = createAdminClient();
  return must(await admin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(200)) ?? [];
}

export async function adminCounts() {
  const admin = createAdminClient();
  const [items, categories, promotions, messages] = await Promise.all([
    admin.from("menu_items").select("id", { count: "exact", head: true }),
    admin.from("menu_categories").select("id", { count: "exact", head: true }),
    admin.from("promotions").select("id", { count: "exact", head: true }).eq("is_active", true),
    admin.from("contact_messages").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  return { items: items.count ?? 0, categories: categories.count ?? 0, promotions: promotions.count ?? 0, newMessages: messages.count ?? 0 };
}
