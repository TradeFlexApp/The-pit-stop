// Generates supabase/seed.sql from src/data/menu.json so the static site and the
// database always carry the same content.  Run:  npm run db:seed:gen
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(join(root, "src/data/menu.json"), "utf8"));

const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `'{${(a ?? []).map((s) => `"${String(s).replace(/(["\\])/g, "\\$1")}"`).join(",")}}'::text[]`;
const bool = (b) => (b ? "true" : "false");
const num = (n) => (n == null ? "null" : String(n));

const out = [];
out.push(`-- =============================================================================
-- The Pit Stop — seed data. GENERATED from src/data/menu.json by scripts/build-seed.mjs.
-- Do not edit by hand: change the JSON and run \`npm run db:seed:gen\`.
-- Safe to re-run (upserts on slugs / natural keys). Prices are CAD cents.
-- =============================================================================
`);

const L = data.location;
out.push(`insert into public.locations
  (slug, name, address_line1, address_line2, city, region, postal_code, country, phone, email, timezone, landmark,
   google_maps_url, doordash_url, skipthedishes_url, online_order_url, instagram_url, tiktok_url, facebook_url, is_primary)
values (${q(L.slug)}, ${q(L.name)}, ${q(L.address_line1)}, ${q(L.address_line2)}, ${q(L.city)}, ${q(L.region)}, ${q(L.postal_code)}, ${q(L.country)},
        ${q(L.phone)}, ${q(L.email)}, ${q(L.timezone)}, ${q(L.landmark)}, ${q(L.google_maps_url)}, ${q(L.doordash_url)}, ${q(L.skipthedishes_url)},
        ${q(L.online_order_url)}, ${q(L.instagram_url)}, ${q(L.tiktok_url)}, ${q(L.facebook_url)}, true)
on conflict (slug) do update set
  name = excluded.name, address_line1 = excluded.address_line1, address_line2 = excluded.address_line2, city = excluded.city,
  region = excluded.region, postal_code = excluded.postal_code, country = excluded.country, phone = excluded.phone, email = excluded.email,
  timezone = excluded.timezone, landmark = excluded.landmark, google_maps_url = excluded.google_maps_url, doordash_url = excluded.doordash_url,
  skipthedishes_url = excluded.skipthedishes_url, online_order_url = excluded.online_order_url, instagram_url = excluded.instagram_url,
  tiktok_url = excluded.tiktok_url, facebook_url = excluded.facebook_url, is_primary = excluded.is_primary;
`);

out.push(`insert into public.business_hours (location_id, day_of_week, opens_at, closes_at, is_closed)
select l.id, d.dow, d.opens::time, d.closes::time, d.closed
from public.locations l
cross join (values
${data.hours.map((h) => `  (${h.day_of_week}, ${q(h.opens_at)}, ${q(h.closes_at)}, ${bool(h.is_closed)})`).join(",\n")}
) as d(dow, opens, closes, closed)
where l.slug = ${q(L.slug)}
on conflict (location_id, day_of_week) do update
  set opens_at = excluded.opens_at, closes_at = excluded.closes_at, is_closed = excluded.is_closed;
`);

out.push(`insert into public.menu_categories (slug, name, description, sort_order) values
${data.categories.map((c) => `  (${q(c.slug)}, ${q(c.name)}, ${q(c.description)}, ${c.sort_order})`).join(",\n")}
on conflict (slug) do update
  set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;
`);

const items = data.categories.flatMap((c) => c.items.map((i) => ({ ...i, category_slug: c.slug })));
out.push(`insert into public.menu_items
  (category_id, slug, name, description, price_cents, image_url, calories, tags, allergens, badge, is_featured, sort_order)
select c.id, i.slug, i.name, i.description, i.price_cents, i.image_url, i.calories, i.tags, i.allergens, i.badge, i.is_featured, i.sort_order
from (values
${items
  .map(
    (i, idx) =>
      `  (${q(i.category_slug)}, ${q(i.slug)}, ${q(i.name)}, ${q(i.description)}, ${i.price_cents}, ${q(i.image ?? null)}${idx === 0 ? "::text" : ""}, ${num(i.calories)}${idx === 0 ? "::integer" : ""}, ${arr(i.tags)}, ${arr(i.allergens)}, ${q(i.badge)}${idx === 0 ? "::text" : ""}, ${bool(i.is_featured)}, ${i.sort_order})`
  )
  .join(",\n")}
) as i(category_slug, slug, name, description, price_cents, image_url, calories, tags, allergens, badge, is_featured, sort_order)
join public.menu_categories c on c.slug = i.category_slug
on conflict (slug) do update
  set category_id = excluded.category_id, name = excluded.name, description = excluded.description, price_cents = excluded.price_cents,
      image_url = coalesce(excluded.image_url, public.menu_items.image_url), calories = excluded.calories, tags = excluded.tags,
      allergens = excluded.allergens, badge = excluded.badge, is_featured = excluded.is_featured, sort_order = excluded.sort_order;
`);

const tierRows = items.flatMap((i) =>
  i.tiers
    ? data.tiers.map((t, idx) => (i.tiers[t.code] == null ? null : { slug: i.slug, code: t.code, label: t.label, price: i.tiers[t.code], sort: idx + 1 })).filter(Boolean)
    : []
);
if (tierRows.length) {
  out.push(`insert into public.menu_item_tiers (item_id, code, label, price_cents, sort_order)
select mi.id, t.code, t.label, t.price_cents, t.sort_order
from (values
${tierRows.map((t) => `  (${q(t.slug)}, ${q(t.code)}, ${q(t.label)}, ${t.price}, ${t.sort})`).join(",\n")}
) as t(item_slug, code, label, price_cents, sort_order)
join public.menu_items mi on mi.slug = t.item_slug
on conflict (item_id, code) do update
  set label = excluded.label, price_cents = excluded.price_cents, sort_order = excluded.sort_order;
`);
}

const A = data.burger_addons;
if (A) {
  out.push(`insert into public.menu_modifier_groups (item_id, name, min_select, max_select, sort_order)
select mi.id, ${q(A.group_name)}, ${A.min_select}, ${A.max_select}, 1
from public.menu_items mi
join public.menu_categories c on c.id = mi.category_id
where c.slug in (${A.applies_to_categories.map(q).join(", ")})
on conflict (item_id, name) do nothing;

insert into public.menu_modifiers (group_id, name, price_delta_cents, sort_order)
select g.id, m.name, m.price_delta_cents, m.sort_order
from public.menu_modifier_groups g
cross join (values
${A.options.map((o, i) => `  (${q(o.name)}, ${o.price_delta_cents}, ${i + 1})`).join(",\n")}
) as m(name, price_delta_cents, sort_order)
where g.name = ${q(A.group_name)}
on conflict (group_id, name) do update set price_delta_cents = excluded.price_delta_cents, sort_order = excluded.sort_order;
`);
}

for (const p of data.promotions ?? []) {
  out.push(`insert into public.promotions (title, body, cta_label, cta_url, is_active, sort_order)
select ${q(p.title)}, ${q(p.body)}, ${q(p.cta_label)}, ${q(p.cta_url)}, ${bool(p.is_active)}, ${p.sort_order}
where not exists (select 1 from public.promotions where title = ${q(p.title)});
`);
}

const target = join(root, "supabase/seed.sql");
writeFileSync(target, out.join("\n"));
console.log(`wrote ${target}: ${data.categories.length} categories, ${items.length} items, ${tierRows.length} tier rows`);
