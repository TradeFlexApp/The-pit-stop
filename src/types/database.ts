// Hand-written to match supabase/migrations/20261105000000_init.sql.
// After linking a Supabase project, regenerate with:  npm run db:types
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export type Database = {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string; slug: string; name: string;
          address_line1: string; address_line2: string | null;
          city: string; region: string; postal_code: string; country: string;
          phone: string | null; email: string | null;
          latitude: number | null; longitude: number | null;
          timezone: string; is_primary: boolean;
        } & Timestamps;
        Insert: {
          id?: string; slug: string; name: string;
          address_line1: string; address_line2?: string | null;
          city: string; region: string; postal_code: string; country?: string;
          phone?: string | null; email?: string | null;
          latitude?: number | null; longitude?: number | null;
          timezone?: string; is_primary?: boolean;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
        Relationships: [];
      };
      business_hours: {
        Row: {
          id: string; location_id: string; day_of_week: number;
          opens_at: string | null; closes_at: string | null; is_closed: boolean;
        };
        Insert: {
          id?: string; location_id: string; day_of_week: number;
          opens_at?: string | null; closes_at?: string | null; is_closed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["business_hours"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "business_hours_location_id_fkey"; columns: ["location_id"]; isOneToOne: false; referencedRelation: "locations"; referencedColumns: ["id"] }
        ];
      };
      menu_categories: {
        Row: {
          id: string; slug: string; name: string; description: string | null;
          sort_order: number; is_active: boolean;
        } & Timestamps;
        Insert: {
          id?: string; slug: string; name: string; description?: string | null;
          sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_categories"]["Insert"]>;
        Relationships: [];
      };
      menu_items: {
        Row: {
          id: string; category_id: string; slug: string; name: string; description: string | null;
          price_cents: number; image_url: string | null; calories: number | null;
          tags: string[]; allergens: string[];
          is_available: boolean; is_featured: boolean; sort_order: number;
        } & Timestamps;
        Insert: {
          id?: string; category_id: string; slug: string; name: string; description?: string | null;
          price_cents: number; image_url?: string | null; calories?: number | null;
          tags?: string[]; allergens?: string[];
          is_available?: boolean; is_featured?: boolean; sort_order?: number;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["menu_items"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "menu_items_category_id_fkey"; columns: ["category_id"]; isOneToOne: false; referencedRelation: "menu_categories"; referencedColumns: ["id"] }
        ];
      };
      menu_modifier_groups: {
        Row: { id: string; item_id: string; name: string; min_select: number; max_select: number; sort_order: number };
        Insert: { id?: string; item_id: string; name: string; min_select?: number; max_select?: number; sort_order?: number };
        Update: Partial<Database["public"]["Tables"]["menu_modifier_groups"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "menu_modifier_groups_item_id_fkey"; columns: ["item_id"]; isOneToOne: false; referencedRelation: "menu_items"; referencedColumns: ["id"] }
        ];
      };
      menu_modifiers: {
        Row: {
          id: string; group_id: string; name: string; price_delta_cents: number;
          is_default: boolean; is_available: boolean; sort_order: number;
        };
        Insert: {
          id?: string; group_id: string; name: string; price_delta_cents?: number;
          is_default?: boolean; is_available?: boolean; sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["menu_modifiers"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "menu_modifiers_group_id_fkey"; columns: ["group_id"]; isOneToOne: false; referencedRelation: "menu_modifier_groups"; referencedColumns: ["id"] }
        ];
      };
      promotions: {
        Row: {
          id: string; title: string; body: string | null; cta_label: string | null; cta_url: string | null;
          image_url: string | null; starts_at: string | null; ends_at: string | null;
          is_active: boolean; sort_order: number;
        } & Timestamps;
        Insert: {
          id?: string; title: string; body?: string | null; cta_label?: string | null; cta_url?: string | null;
          image_url?: string | null; starts_at?: string | null; ends_at?: string | null;
          is_active?: boolean; sort_order?: number; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["promotions"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: { id: string; email: string; source: string | null; subscribed_at: string; unsubscribed_at: string | null };
        Insert: { id?: string; email: string; source?: string | null; subscribed_at?: string; unsubscribed_at?: string | null };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string; order_number: number; location_id: string;
          customer_name: string; customer_phone: string; customer_email: string | null;
          fulfillment: Database["public"]["Enums"]["fulfillment_type"];
          requested_at: string | null;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number; tax_cents: number; tip_cents: number; total_cents: number;
          notes: string | null;
        } & Timestamps;
        Insert: {
          id?: string; location_id: string;
          customer_name: string; customer_phone: string; customer_email?: string | null;
          fulfillment?: Database["public"]["Enums"]["fulfillment_type"];
          requested_at?: string | null;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number; tax_cents?: number; tip_cents?: number; total_cents: number;
          notes?: string | null; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "orders_location_id_fkey"; columns: ["location_id"]; isOneToOne: false; referencedRelation: "locations"; referencedColumns: ["id"] }
        ];
      };
      order_items: {
        Row: {
          id: string; order_id: string; menu_item_id: string | null; item_name: string;
          unit_price_cents: number; quantity: number; modifiers: Json; line_total_cents: number;
        };
        Insert: {
          id?: string; order_id: string; menu_item_id?: string | null; item_name: string;
          unit_price_cents: number; quantity: number; modifiers?: Json; line_total_cents: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          { foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] },
          { foreignKeyName: "order_items_menu_item_id_fkey"; columns: ["menu_item_id"]; isOneToOne: false; referencedRelation: "menu_items"; referencedColumns: ["id"] }
        ];
      };
      contact_messages: {
        Row: {
          id: string; name: string; email: string; phone: string | null; subject: string | null;
          message: string; status: Database["public"]["Enums"]["contact_status"]; created_at: string;
        };
        Insert: {
          id?: string; name: string; email: string; phone?: string | null; subject?: string | null;
          message: string; status?: Database["public"]["Enums"]["contact_status"]; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
      ai_chat_logs: {
        Row: {
          id: string; session_id: string | null; question: string; answer: string;
          model: string | null; latency_ms: number | null; created_at: string;
        };
        Insert: {
          id?: string; session_id?: string | null; question: string; answer: string;
          model?: string | null; latency_ms?: number | null; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["ai_chat_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      order_status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
      fulfillment_type: "pickup" | "delivery" | "dine_in";
      contact_status: "new" | "read" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
};

// Convenience aliases
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
export type InsertDto<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"];
export type Enums<T extends keyof Database["public"]["Enums"]> = Database["public"]["Enums"][T];

export type Location = Tables<"locations">;
export type BusinessHours = Tables<"business_hours">;
export type MenuCategory = Tables<"menu_categories">;
export type MenuItem = Tables<"menu_items">;
export type MenuModifierGroup = Tables<"menu_modifier_groups">;
export type MenuModifier = Tables<"menu_modifiers">;
export type Promotion = Tables<"promotions">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type ContactMessage = Tables<"contact_messages">;
