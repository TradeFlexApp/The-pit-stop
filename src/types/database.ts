// Hand-maintained app-facing types. The raw schema shape is generated into
// src/types/supabase.ts (npm run db:types); keep aliases here so regeneration never breaks imports.
import type { Database } from "./supabase";

export type { Database, Json } from "./supabase";

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

export type Location = Tables<"locations">;
export type BusinessHours = Tables<"business_hours">;
export type MenuCategory = Tables<"menu_categories">;
export type MenuItem = Tables<"menu_items">;
export type MenuItemTier = Tables<"menu_item_tiers">;
export type MenuModifierGroup = Tables<"menu_modifier_groups">;
export type MenuModifier = Tables<"menu_modifiers">;
export type Promotion = Tables<"promotions">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type ContactMessage = Tables<"contact_messages">;
