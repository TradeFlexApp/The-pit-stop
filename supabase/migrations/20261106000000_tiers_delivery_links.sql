-- =============================================================================
-- The Pit Stop — menu tiers (1500 / 2500 / 3500) and delivery / social links
-- =============================================================================

-- Burgers come in three "engine sizes": 1500 = single, 2500 = double, 3500 = triple.
-- Items without tiers (sides, drinks) keep using menu_items.price_cents.
create table public.menu_item_tiers (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references public.menu_items(id) on delete cascade,
  code         text not null,                 -- '1500' | '2500' | '3500'
  label        text not null,                 -- 'Single' | 'Double' | 'Triple'
  price_cents  integer not null check (price_cents >= 0),
  sort_order   integer not null default 0,
  unique (item_id, code)
);
comment on table public.menu_item_tiers is 'Per-item price tiers. For burgers: 1500 single, 2500 double, 3500 triple. price_cents on the item is the lowest tier.';
create index menu_item_tiers_item_idx on public.menu_item_tiers (item_id, sort_order);

alter table public.menu_item_tiers enable row level security;
create policy "Public can read menu tiers"
  on public.menu_item_tiers for select to anon, authenticated using (true);

-- Short marketing badge shown on a card, e.g. 'Fan favourite', 'New', 'Breakfast till 11'.
alter table public.menu_items add column badge text;

-- Ordering platforms + socials, editable without a deploy. Null = "coming soon".
alter table public.locations
  add column doordash_url       text,
  add column skipthedishes_url  text,
  add column online_order_url   text,
  add column google_maps_url    text,
  add column instagram_url      text,
  add column tiktok_url         text,
  add column facebook_url       text,
  add column landmark           text;         -- e.g. 'Across from the Oil Sands Discovery Centre'

-- The restaurant is in Fort McMurray, Alberta.
alter table public.locations alter column country set default 'CA';
alter table public.locations alter column timezone set default 'America/Edmonton';
