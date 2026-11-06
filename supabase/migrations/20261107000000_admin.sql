-- =============================================================================
-- The Pit Stop — admin access + photo storage
-- Admins sign in with Supabase Auth (email + password). A user may edit the site if
-- their email is listed in ADMIN_EMAILS (env) OR in public.admin_users.
-- All admin writes go through server actions using the secret key, so no table
-- needs write policies for authenticated users.
-- =============================================================================

create table public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique check (email = lower(email)),
  created_at  timestamptz not null default now()
);
comment on table public.admin_users is 'Allowlist of staff who may use /admin. Add rows with the SQL in README.md, or use the ADMIN_EMAILS env var instead.';
alter table public.admin_users enable row level security;   -- no policies: server only

-- Public bucket for menu / promotion photos. Anyone can view, only the server (secret key) can upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-images', 'menu-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "Public can read menu images"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'menu-images');
