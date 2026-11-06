# The Pit Stop

Website for The Pit Stop smash burger restaurant. Next.js frontend and backend on Vercel,
Supabase (Postgres) for data, Google Gemini (free tier) for the menu assistant.

## Stack

| Piece | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS 4) |
| Database | Supabase Postgres with Row Level Security |
| AI | Google Gemini via `@google/genai`, default model `gemini-3.5-flash-lite` (free tier) |
| Hosting | Vercel (frontend + API routes), Vercel Analytics |
| Validation | Zod |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the keys (see below)
npm run dev                  # http://localhost:3000
```

Check wiring at `http://localhost:3000/api/health`. It reports booleans for `supabase`, `supabaseSecret` and `gemini`.

### 1. Supabase

1. Create a project at https://supabase.com/dashboard.
2. Dashboard → Project Settings → API Keys: copy the Project URL, the **publishable** key and the **secret** key into `.env.local`.
3. Link the CLI and apply the schema and sample data:

   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npm run db:push     # applies supabase/migrations/*.sql
   npm run db:seed     # loads supabase/seed.sql (sample menu, hours, promo)
   npm run db:types    # regenerates src/types/database.ts from the live schema
   ```

   Site content lives in `src/data/menu.json` (single source of truth). Edit it, run `npm run db:seed:gen` to regenerate `supabase/seed.sql`, then `npm run db:seed` (it upserts). Do not hand-edit `seed.sql`. Day-to-day changes are made in `/admin`; re-running `db:seed` would overwrite them with the JSON, so only use it for the initial load.

### 2. Gemini (free tier)

1. Create an API key at https://aistudio.google.com/apikey (no billing needed).
2. Put it in `.env.local` as `GEMINI_API_KEY`.
3. Optional: set `GEMINI_MODEL=gemini-3.8-flash` for smarter answers. Both models are free of charge; limits are per project and visible in AI Studio.

Free-tier note: Google may use free-tier prompts to improve its products, so the assistant only ever receives public menu and hours data plus the guest's question.

### 3. Vercel

1. Push this repo to GitHub and import it at https://vercel.com/new (framework auto-detected).
2. Add the four environment variables from `.env.example` for Production and Preview.
3. Deploy. API routes run as Vercel Functions; no extra config needed.

## Admin (self-updating site)

Staff edit the menu, prices and sizes, photos, hours, delivery links, social links and promotions at `/admin`
(there is a small "Admin" link in the website footer). Every save refreshes the public site immediately.

Setting up the first admin:

1. Supabase Dashboard → Authentication → Sign In / Providers → turn **off** "Allow new users to sign up".
   Admin accounts are created by hand, and leaving sign-up on would let a stranger register an allowlisted address.
   (The local stack already ships with `enable_signup = false` in `supabase/config.toml`.)
2. Authentication → Users → **Add user** (email + password, tick "auto confirm").
3. Allow that account. Preferred: bind it by account id in the SQL editor (do this after the user exists):

   ```sql
   insert into public.admin_users (user_id, email)
   select id, email from auth.users where email = 'you@example.com';
   ```
   Alternative: `ADMIN_EMAILS=you@example.com,other@example.com` (local `.env.local` and Vercel). Only list addresses whose
   accounts already exist in Authentication → Users.
4. Sign in at `/admin/login`.

Photos upload to the public Supabase Storage bucket `menu-images` (created by the migration).
The website falls back to the bundled content in `src/data/menu.json` until the database has data,
so run `npm run db:seed` once after `npm run db:push` to start from the draft menu.

## Database schema

Defined in `supabase/migrations/20261105000000_init.sql`. Money is stored as integer cents.

| Table | Purpose | Public access |
| --- | --- | --- |
| `locations`, `business_hours` | Address, phone, weekly hours | read |
| `menu_categories`, `menu_items` | The menu, with tags, allergens, calories, featured flag | read |
| `menu_modifier_groups`, `menu_modifiers` | Add-ons / options per item with price deltas | read |
| `promotions` | Specials shown while active and inside their date window | read (live only) |
| `orders`, `order_items` | Online orders (pickup / delivery / dine-in) with line-item snapshots | server only |
| `contact_messages` | Contact form submissions | server only |
| `newsletter_subscribers` | Email sign-ups (case-insensitive unique) | server only |
| `ai_chat_logs` | Questions and answers from the Gemini assistant | server only |

"Server only" tables have RLS enabled with no policies, so only API routes using the secret key can touch them.

## API routes

| Route | Method | What it does |
| --- | --- | --- |
| `/api/health` | GET | Reports which integrations are configured (booleans only) |
| `/api/ask` | POST `{ question, sessionId? }` | Gemini answers using the live menu, hours and location as context; logs to `ai_chat_logs` |
| `/api/contact` | POST `{ name, email, phone?, subject?, message }` | Stores a contact message (honeypot field `website` must stay empty) |

## Project layout

```
src/app/                 pages, layout, API routes
src/lib/env.ts           public env (browser-safe), lazy validation
src/lib/env.server.ts    server secrets (Supabase secret key, Gemini key/model)
src/lib/supabase/        client.ts (browser), server.ts (RSC/route), admin.ts (secret key)
src/lib/data/menu.ts     typed menu/location/promotion queries + prompt formatter
src/lib/gemini.ts        Gemini client and the menu-assistant prompt
src/data/menu.json       site content (single source of truth; generates seed.sql)
src/types/database.ts    app-facing types; src/types/supabase.ts is generated (npm run db:types)
supabase/migrations/     schema; supabase/seed.sql sample data
```

## Scripts

`npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`,
`npm run db:push`, `npm run db:seed`, `npm run db:reset` (local stack), `npm run db:types`.
