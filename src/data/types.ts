// View models shared by the static content (src/data/menu.json) and the Supabase data layer.
// Pages render these; they never touch database rows directly.

export type TierCode = "1500" | "2500" | "3500";

export interface TierInfo {
  code: TierCode;
  label: string;
  blurb: string;
}

export interface MenuTierView {
  code: TierCode;
  label: string;
  price_cents: number;
  sort_order: number;
}

export interface MenuItemView {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  /** Lowest price for the item (the 1500 tier for burgers). CAD cents. */
  price_cents: number;
  image_url: string | null;
  calories: number | null;
  tags: string[];
  allergens: string[];
  badge: string | null;
  is_available: boolean;
  is_featured: boolean;
  sort_order: number;
  tiers: MenuTierView[];
}

export interface MenuCategoryView {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
  items: MenuItemView[];
}

export interface HoursView {
  day_of_week: number; // 0 = Sunday
  opens_at: string | null; // "07:00"
  closes_at: string | null;
  is_closed: boolean;
}

export interface LocationView {
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  region: string;
  postal_code: string;
  country: string;
  phone: string | null;
  email: string | null;
  landmark: string | null;
  timezone: string;
  google_maps_url: string | null;
  doordash_url: string | null;
  skipthedishes_url: string | null;
  online_order_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  hours: HoursView[];
}

export interface PromotionView {
  title: string;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
}

export interface FaqView {
  q: string;
  a: string;
}

export interface ValueProp {
  title: string;
  body: string;
}

export interface AddonView {
  name: string;
  price_delta_cents: number;
}

export interface SiteContent {
  location: LocationView;
  tiers: TierInfo[];
  /** Burger add-ons (shared by every burger). */
  addons: AddonView[];
  categories: MenuCategoryView[];
  promotions: PromotionView[];
  faqs: FaqView[];
  value_props: ValueProp[];
}
