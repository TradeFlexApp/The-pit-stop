"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAllowedAdmin, requireAdmin } from "@/lib/admin/auth";
import type { InsertDto } from "@/types/database";
import { IMAGE_TYPES, MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "@/lib/admin/limits";
import { localInputToIso } from "@/lib/zoned-time";

const CONTENT_TAG = "site-content";
const TIERS = [
  { code: "1500", label: "Single" },
  { code: "2500", label: "Double" },
  { code: "3500", label: "Triple" },
] as const;

// ---------- helpers ----------------------------------------------------------
const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};
const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const cents = (s: string): number | null => {
  if (!s) return null;
  const n = Number(s.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};
const int = (s: string, fallback = 0) => {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
};
const list = (s: string) => Array.from(new Set(s.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean)));
const nullable = (s: string) => (s ? s : null);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "item";
const urlOrNull = (s: string) => {
  if (!s) return null;
  const ok = z.url().safeParse(s);
  if (!ok.success) throw new Error(`"${s.slice(0, 40)}" is not a valid link (include https://).`);
  return s;
};
/** Site-relative paths ("/menu#breakfast") or full https:// links only. */
const ctaUrlOrNull = (s: string) => {
  if (!s) return null;
  if (/^\/[^\/\\]/.test(s) || s.startsWith("#")) return s;
  const ok = z.url({ protocol: /^https?$/ }).safeParse(s);
  if (!ok.success) throw new Error("The button link must start with / (a page on this site) or https://.");
  return s;
};
function go(path: string, params: Record<string, string>): never {
  const q = new URLSearchParams(params).toString();
  redirect(q ? `${path}?${q}` : path);
}
function message(e: unknown, fallback: string) {
  return e instanceof Error && e.message ? e.message : fallback;
}

async function uploadImage(file: File, folder: string, slug: string): Promise<string> {
  if (file.size > MAX_IMAGE_BYTES) throw new Error(`Photos must be under ${MAX_IMAGE_LABEL}.`);
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new Error("Use a JPG, PNG, WEBP or AVIF photo.");
  const admin = createAdminClient();
  const path = `${folder}/${slug}-${Date.now()}.${ext}`;
  const body = Buffer.from(await file.arrayBuffer());
  const { error } = await admin.storage.from("menu-images").upload(path, body, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw new Error(`Photo upload failed: ${error.message}`);
  return admin.storage.from("menu-images").getPublicUrl(path).data.publicUrl;
}

// ---------- auth -------------------------------------------------------------
export async function signIn(formData: FormData) {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");
  let code: string | null = null;
  if (!email || !password) {
    code = "missing";
  } else {
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError || !data.user) code = "bad-credentials";
    else if (!(await isAllowedAdmin(data.user))) {
      await supabase.auth.signOut();
      code = "not-allowed";
    }
  }
  if (code) go("/admin/login", { error: code });
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- menu items -------------------------------------------------------
export async function saveItem(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = str(formData, "id");
  let savedId = id;
  let error: string | null = null;

  try {
    const name = str(formData, "name");
    if (!name) throw new Error("Give the item a name.");
    const category_id = str(formData, "category_id");
    if (!category_id) throw new Error("Pick a category.");
    const hasSizes = bool(formData, "has_sizes");
    let tiers: { code: string; label: string; price_cents: number; sort_order: number }[] = [];
    let price_cents: number | null = null;
    if (hasSizes) {
      tiers = TIERS.map((t, i) => ({ code: t.code, label: t.label, price_cents: cents(str(formData, `tier_${t.code}`)) ?? -1, sort_order: i + 1 }));
      if (tiers.some((t) => t.price_cents < 0)) throw new Error("Enter a price for all three sizes (1500, 2500, 3500).");
      price_cents = Math.min(...tiers.map((t) => t.price_cents));
    } else {
      price_cents = cents(str(formData, "price"));
      if (price_cents == null) throw new Error("Enter a price.");
    }

    const base: InsertDto<"menu_items"> = {
      category_id,
      name,
      slug: id ? str(formData, "slug") || slugify(name) : slugify(str(formData, "slug") || name),
      description: nullable(str(formData, "description")),
      badge: nullable(str(formData, "badge")),
      calories: str(formData, "calories") ? int(str(formData, "calories")) : null,
      tags: list(str(formData, "tags")),
      allergens: list(str(formData, "allergens")),
      is_available: bool(formData, "is_available"),
      is_featured: bool(formData, "is_featured"),
      sort_order: int(str(formData, "sort_order")),
      price_cents,
    };

    const file = formData.get("image");
    if (file instanceof File && file.size > 0) base.image_url = await uploadImage(file, "items", base.slug);
    else if (bool(formData, "remove_image")) base.image_url = null;

    if (!id) {
      // New item: make the slug unique by suffixing if needed.
      let attempt = 0;
      for (;;) {
        const slug = attempt ? `${base.slug}-${attempt + 1}` : base.slug;
        const { data, error: insErr } = await admin.from("menu_items").insert({ ...base, slug }).select("id").single();
        if (!insErr) {
          savedId = data.id;
          break;
        }
        if (insErr.code === "23505" && attempt < 5) {
          attempt++;
          continue;
        }
        throw new Error(insErr.message);
      }
    } else {
      const { error: updErr } = await admin.from("menu_items").update(base).eq("id", id);
      if (updErr) throw new Error(updErr.message);
    }

    // Upsert the submitted sizes first, then drop the ones no longer offered, so a failure never leaves an item without prices.
    if (tiers.length) {
      const { error: tierErr } = await admin.from("menu_item_tiers").upsert(tiers.map((t) => ({ ...t, item_id: savedId })), { onConflict: "item_id,code" });
      if (tierErr) throw new Error(tierErr.message);
    }
    const keep = tiers.map((t) => t.code);
    const query = admin.from("menu_item_tiers").delete().eq("item_id", savedId);
    const { error: delErr } = keep.length ? await query.not("code", "in", `(${keep.join(",")})`) : await query;
    if (delErr) throw new Error(delErr.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not save the item.");
  }

  // If a new item was already created before the failure, land on its page so a retry edits it instead of duplicating it.
  if (error) go(`/admin/menu/${savedId || "new"}`, { error });
  go(`/admin/menu/${savedId}`, { ok: "1" });
}

export async function deleteItem(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  let error: string | null = null;
  try {
    const { error: e } = await createAdminClient().from("menu_items").delete().eq("id", id);
    if (e) throw new Error(e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not delete the item.");
  }
  if (error) go(`/admin/menu/${id}`, { error });
  go("/admin/menu", { ok: "1" });
}

// ---------- categories -------------------------------------------------------
export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  let error: string | null = null;
  try {
    const name = str(formData, "name");
    if (!name) throw new Error("Give the category a name.");
    const row: InsertDto<"menu_categories"> = {
      name,
      slug: id ? str(formData, "slug") || slugify(name) : slugify(str(formData, "slug") || name),
      description: nullable(str(formData, "description")),
      sort_order: int(str(formData, "sort_order")),
      is_active: bool(formData, "is_active"),
    };
    const admin = createAdminClient();
    const { error: e } = id ? await admin.from("menu_categories").update(row).eq("id", id) : await admin.from("menu_categories").insert(row);
    if (e) throw new Error(e.code === "23505" ? "A category with that name already exists." : e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not save the category.");
  }
  if (error) go("/admin/menu", { error });
  go("/admin/menu", { ok: "1" });
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  let error: string | null = null;
  try {
    const admin = createAdminClient();
    const { count } = await admin.from("menu_items").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (count) throw new Error("Move or delete the items in this category first.");
    const { error: e } = await admin.from("menu_categories").delete().eq("id", id);
    if (e) throw new Error(e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not delete the category.");
  }
  if (error) go("/admin/menu", { error });
  go("/admin/menu", { ok: "1" });
}

// ---------- location, hours, links --------------------------------------------
export async function saveLocation(formData: FormData) {
  await requireAdmin();
  let error: string | null = null;
  try {
    const admin = createAdminClient();
    const id = str(formData, "id");
    const row: InsertDto<"locations"> = {
      slug: id ? str(formData, "slug") || "main" : "main",
      name: str(formData, "name") || "The Pit Stop",
      address_line1: str(formData, "address_line1"),
      address_line2: nullable(str(formData, "address_line2")),
      city: str(formData, "city"),
      region: str(formData, "region"),
      postal_code: str(formData, "postal_code"),
      country: str(formData, "country") || "CA",
      phone: nullable(str(formData, "phone")),
      email: nullable(str(formData, "email")),
      landmark: nullable(str(formData, "landmark")),
      google_maps_url: urlOrNull(str(formData, "google_maps_url")),
      online_order_url: urlOrNull(str(formData, "online_order_url")),
      doordash_url: urlOrNull(str(formData, "doordash_url")),
      skipthedishes_url: urlOrNull(str(formData, "skipthedishes_url")),
      instagram_url: urlOrNull(str(formData, "instagram_url")),
      tiktok_url: urlOrNull(str(formData, "tiktok_url")),
      facebook_url: urlOrNull(str(formData, "facebook_url")),
      is_primary: true,
    };
    if (!row.address_line1 || !row.city || !row.region) throw new Error("Address, city and province are required.");
    const { error: e } = id ? await admin.from("locations").update(row).eq("id", id) : await admin.from("locations").insert(row);
    if (e) throw new Error(e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not save the location.");
  }
  if (error) go("/admin/location", { error });
  go("/admin/location", { ok: "1" });
}

export async function saveHours(formData: FormData) {
  await requireAdmin();
  let error: string | null = null;
  try {
    const location_id = str(formData, "location_id");
    if (!location_id) throw new Error("Save the address first, then set the hours.");
    const rows: InsertDto<"business_hours">[] = [];
    for (let d = 0; d < 7; d++) {
      const is_closed = bool(formData, `closed_${d}`);
      const opens_at = str(formData, `opens_${d}`);
      const closes_at = str(formData, `closes_${d}`);
      if (!is_closed && !(/^\d{2}:\d{2}$/.test(opens_at) && /^\d{2}:\d{2}$/.test(closes_at))) {
        throw new Error("Enter opening and closing times for every day that isn't closed.");
      }
      rows.push({ location_id, day_of_week: d, is_closed, opens_at: is_closed ? null : opens_at, closes_at: is_closed ? null : closes_at });
    }
    const { error: e } = await createAdminClient().from("business_hours").upsert(rows, { onConflict: "location_id,day_of_week" });
    if (e) throw new Error(e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not save the hours.");
  }
  if (error) go("/admin/location", { error });
  go("/admin/location", { ok: "1" });
}

// ---------- promotions -------------------------------------------------------

export async function savePromotion(formData: FormData) {
  await requireAdmin();
  const id = str(formData, "id");
  let error: string | null = null;
  try {
    const title = str(formData, "title");
    if (!title) throw new Error("Give the promotion a title.");
    const row: InsertDto<"promotions"> = {
      title,
      body: nullable(str(formData, "body")),
      cta_label: nullable(str(formData, "cta_label")),
      cta_url: ctaUrlOrNull(str(formData, "cta_url")),
      starts_at: localInputToIso(str(formData, "starts_at")),
      ends_at: localInputToIso(str(formData, "ends_at")),
      is_active: bool(formData, "is_active"),
      sort_order: int(str(formData, "sort_order")),
    };
    if (row.starts_at && row.ends_at && row.ends_at < row.starts_at) throw new Error("The end date is before the start date.");
    const file = formData.get("image");
    if (file instanceof File && file.size > 0) row.image_url = await uploadImage(file, "promotions", slugify(title));
    else if (bool(formData, "remove_image")) row.image_url = null;
    const admin = createAdminClient();
    const { error: e } = id ? await admin.from("promotions").update(row).eq("id", id) : await admin.from("promotions").insert(row);
    if (e) throw new Error(e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not save the promotion.");
  }
  if (error) go("/admin/promotions", { error });
  go("/admin/promotions", { ok: "1" });
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  let error: string | null = null;
  try {
    const { error: e } = await createAdminClient().from("promotions").delete().eq("id", str(formData, "id"));
    if (e) throw new Error(e.message);
    updateTag(CONTENT_TAG);
  } catch (e) {
    error = message(e, "Could not delete the promotion.");
  }
  if (error) go("/admin/promotions", { error });
  go("/admin/promotions", { ok: "1" });
}

// ---------- contact messages -------------------------------------------------
export async function setMessageStatus(formData: FormData) {
  await requireAdmin();
  const status = str(formData, "status");
  if (status !== "new" && status !== "read" && status !== "archived") go("/admin/messages", { error: "Unknown status." });
  const { error } = await createAdminClient().from("contact_messages").update({ status }).eq("id", str(formData, "id"));
  if (error) go("/admin/messages", { error: error.message });
  go("/admin/messages", { ok: "1" });
}
