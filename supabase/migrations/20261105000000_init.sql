-- =============================================================================
-- The Pit Stop — initial database schema (Supabase / Postgres)
-- Apply with:  npx supabase link --project-ref <ref>   then   npm run db:push
-- Conventions: money is stored in integer cents; all tables have RLS enabled.
-- Public tables (menu, hours, promotions) are readable by anyone.
-- Write-side tables (orders, contact, newsletter, AI logs) have NO policies,
-- so only the server (secret key) can touch them via the API routes.
-- =============================================================================

-- ---------- enums ------------------------------------------------------------
create type public.order_status as enum
  ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
create type public.fulfillment_type as enum ('pickup', 'delivery', 'dine_in');
create type public.contact_status as enum ('new', 'read', 'archived');

-- ---------- helpers ----------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- locations & hours ------------------------------------------------
create table public.locations (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  address_line1  text not null,
  address_line2  text,
  city           text not null,
  region         text not null,                 -- state / province
  postal_code    text not null,
  country        text not null default 'US',
  phone          text,
  email          text,
  latitude       double precision,
  longitude      double precision,
  timezone       text not null default 'America/Denver',
  is_primary     boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table public.locations is 'Restaurant locations. One row is marked is_primary for the website header/footer.';

create table public.business_hours (
  id           uuid primary key default gen_random_uuid(),
  location_id  uuid not null references public.locations(id) on delete cascade,
  day_of_week  smallint not null check (day_of_week between 0 and 6),  -- 0 = Sunday
  opens_at     time,
  closes_at    time,
  is_closed    boolean not null default false,
  unique (location_id, day_of_week),
  check (is_closed or (opens_at is not null and closes_at is not null))
);
comment on table public.business_hours is 'Weekly opening hours per location (local time of the location).';

-- ---------- menu ---------------------------------------------------------------
create table public.menu_categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.menu_items (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.menu_categories(id) on delete restrict,
  slug          text not null unique,
  name          text not null,
  description   text,
  price_cents   integer not null check (price_cents >= 0),
  image_url     text,
  calories      integer check (calories >= 0),
  tags          text[] not null default '{}',   -- e.g. {bestseller,spicy,vegetarian,vegan}
  allergens     text[] not null default '{}',   -- e.g. {gluten,dairy,egg,soy,nuts}
  is_available  boolean not null default true,  -- false = shown as sold out / hidden
  is_featured   boolean not null default false, -- hero / "fan favorites" strip
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.menu_modifier_groups (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references public.menu_items(id) on delete cascade,
  name        text not null,                      -- 'Add-ons', 'Sauce', 'Remove'
  min_select  smallint not null default 0 check (min_select >= 0),
  max_select  smallint not null default 1 check (max_select >= 1),
  sort_order  integer not null default 0,
  unique (item_id, name),
  check (max_select >= min_select)
);

create table public.menu_modifiers (
  id                 uuid primary key default gen_random_uuid(),
  group_id           uuid not null references public.menu_modifier_groups(id) on delete cascade,
  name               text not null,
  price_delta_cents  integer not null default 0,
  is_default         boolean not null default false,
  is_available       boolean not null default true,
  sort_order         integer not null default 0,
  unique (group_id, name)
);

-- ---------- marketing ----------------------------------------------------------
create table public.promotions (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text,
  cta_label   text,
  cta_url     text,
  image_url   text,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at >= starts_at)
);
comment on table public.promotions is 'Banners / specials shown on the site while active and within the date window.';

create table public.newsletter_subscribers (
  id                uuid primary key default gen_random_uuid(),
  email             text not null,
  email_normalized  text generated always as (lower(email)) stored unique,  -- plain unique key so upserts can target it
  source            text,                          -- 'footer', 'checkout', ...
  subscribed_at     timestamptz not null default now(),
  unsubscribed_at   timestamptz
);

-- ---------- orders -------------------------------------------------------------
create table public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    bigint generated always as identity unique,
  location_id     uuid not null references public.locations(id),
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  fulfillment     public.fulfillment_type not null default 'pickup',
  requested_at    timestamptz,                   -- requested pickup / delivery time
  status          public.order_status not null default 'pending',
  subtotal_cents  integer not null check (subtotal_cents >= 0),
  tax_cents       integer not null default 0 check (tax_cents >= 0),
  tip_cents       integer not null default 0 check (tip_cents >= 0),
  total_cents     integer not null check (total_cents >= 0),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  menu_item_id      uuid references public.menu_items(id) on delete set null,
  item_name         text not null,                -- snapshot at time of order
  unit_price_cents  integer not null check (unit_price_cents >= 0),
  quantity          integer not null check (quantity > 0),
  modifiers         jsonb not null default '[]'::jsonb,   -- snapshot of chosen modifiers
  line_total_cents  integer not null check (line_total_cents >= 0)
);

-- ---------- inbound ------------------------------------------------------------
create table public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  status      public.contact_status not null default 'new',
  created_at  timestamptz not null default now()
);

create table public.ai_chat_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  text,
  question    text not null,
  answer      text not null,
  model       text,
  latency_ms  integer,
  created_at  timestamptz not null default now()
);
comment on table public.ai_chat_logs is 'Questions asked to the Gemini menu assistant, for review and prompt tuning.';

-- ---------- indexes ------------------------------------------------------------
create index business_hours_location_idx     on public.business_hours (location_id);
create index menu_items_category_idx         on public.menu_items (category_id, sort_order);
create index menu_items_featured_idx         on public.menu_items (is_featured) where is_featured;
create index menu_modifier_groups_item_idx   on public.menu_modifier_groups (item_id);
create index menu_modifiers_group_idx        on public.menu_modifiers (group_id);
create index promotions_active_idx           on public.promotions (is_active, starts_at, ends_at);
create index orders_status_created_idx       on public.orders (status, created_at desc);
create index orders_location_idx             on public.orders (location_id);
create index order_items_order_idx           on public.order_items (order_id);
create index contact_messages_status_idx     on public.contact_messages (status, created_at desc);
create index ai_chat_logs_created_idx        on public.ai_chat_logs (created_at desc);

-- ---------- updated_at triggers ------------------------------------------------
create trigger set_updated_at before update on public.locations        for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.menu_categories  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.menu_items       for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.promotions       for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.orders           for each row execute function public.set_updated_at();

-- ---------- row level security -------------------------------------------------
alter table public.locations              enable row level security;
alter table public.business_hours         enable row level security;
alter table public.menu_categories        enable row level security;
alter table public.menu_items             enable row level security;
alter table public.menu_modifier_groups   enable row level security;
alter table public.menu_modifiers         enable row level security;
alter table public.promotions             enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.ai_chat_logs           enable row level security;

-- Public, read-only content for the website
create policy "Public can read locations"
  on public.locations for select to anon, authenticated using (true);
create policy "Public can read business hours"
  on public.business_hours for select to anon, authenticated using (true);
create policy "Public can read active categories"
  on public.menu_categories for select to anon, authenticated using (is_active);
create policy "Public can read menu items"
  on public.menu_items for select to anon, authenticated
  using (exists (select 1 from public.menu_categories c where c.id = category_id and c.is_active));
create policy "Public can read modifier groups"
  on public.menu_modifier_groups for select to anon, authenticated using (true);
create policy "Public can read modifiers"
  on public.menu_modifiers for select to anon, authenticated using (true);
create policy "Public can read live promotions"
  on public.promotions for select to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >= now())
  );

-- orders, order_items, contact_messages, newsletter_subscribers, ai_chat_logs:
-- RLS on, no policies => only the server-side secret key (which bypasses RLS)
-- can read or write them. All writes go through /api routes.
