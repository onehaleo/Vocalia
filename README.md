# Vocalia

Vocalia is a **mobile-first** web app for **adult learners** who want clearer **European Portuguese** pronunciation and everyday phrasing. The first MVP ships one paid curriculum track (A1–B2 seed content), **Supabase** for auth and data, and **Stripe Checkout** for a **one-time** purchase (code is structured so **subscriptions** can be added later).

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Auth, Postgres, Row Level Security (storage is optional; phrases use `audio_url` text for hosted files)

Supabase clients live under **`utils/supabase/`** (browser + server + middleware session refresh), matching current Supabase docs. App code can keep importing **`@/lib/supabase/server`** (`await createClient()`), which delegates to `utils/supabase/server` with `await cookies()`.

Optional — Supabase Agent Skills for Cursor: `npx skills add supabase/agent-skills`

- **Stripe** — Checkout (`payment` mode) + webhooks to flip `profiles.has_paid_access`

## Project overview

| Area | Description |
|------|-------------|
| Marketing | Landing (`/`), pricing (`/pricing`), FAQ, CTAs |
| Auth | Email/password via Supabase; protected `/dashboard`, `/levels/*`, `/lessons/*` |
| Paywall | Unpaid users see level cards with **lesson counts** and a **locked** state; paid users load full lessons/phrases under RLS |
| Curriculum | CEFR levels → lessons → phrases with phonetic scaffolding and progress tables |
| Progress | Server actions in `lib/progress.ts` — phrase status, practice counts, lesson completion |

## Local setup

### 1. Clone and install

```bash
cd Vocalia
npm install
```

### 2. Environment variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable** key (Dashboard → API). Legacy: `NEXT_PUBLIC_SUPABASE_ANON_KEY` still works if unset. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** — server only; used by the Stripe webhook to update profiles and insert `payments` |
| `NEXT_PUBLIC_APP_URL` | Canonical app origin (no trailing slash), used in redirects and email confirmation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (reserved for future Elements; checkout still needs Stripe env on the server) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the Stripe webhook endpoint |
| `STRIPE_PRICE_ID` | **One-time** Price ID (`mode=payment` in Checkout) |

**Assumption (MVP):** Checkout is **one-time** (`payment`). To add subscriptions later, create a recurring Price, switch Checkout `mode` to `subscription`, and extend the webhook to handle `customer.subscription.*` events (documented as a next step below).

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **`db/schema.sql`** end-to-end (extensions, tables, triggers, RLS).
3. Run **`db/seed.sql`** to load levels, lessons, and phrases (seed / illustrative copy).
4. **Auth → URL configuration**
   - Set **Site URL** to your `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`).
   - Add redirect: `http://localhost:3000/auth/callback` (and production URL when you deploy).
5. **Email auth**  
   For local dev you can disable “Confirm email” under Authentication settings so sign-up logs in immediately.

**Profiles:** New users get a row in `public.profiles` via the `on_auth_user_created` trigger. Paid fields and `stripe_customer_id` are only writable by the **service role** (webhook); normal users cannot flip `has_paid_access` thanks to the `profiles_self_update_guard` trigger.

**RLS summary:**

- `profiles` — users read/update own row (sensitive columns guarded by trigger).
- `levels` — any **authenticated** user can read (for dashboard preview + `lesson_count`).
- `lessons`, `phrases` — read only if `profiles.has_paid_access` is true and lessons are published.
- `user_lesson_progress`, `user_phrase_progress` — users read/write **own** rows only.
- `payments` — **no** policy for `authenticated`; inserts/updates happen with the **service role** in the webhook (bypasses RLS).

### 4. Stripe setup

1. In the Stripe Dashboard, create a **Product** and a **one-time Price** (e.g. EUR). Copy the **Price ID** (`price_…`) into **`STRIPE_PRICE_ID`** in `.env.local`. Subscription prices will fail: the app uses Checkout **`mode: "payment"`** (one-time). If `STRIPE_PRICE_ID` is missing, checkout redirects back to **`/pricing`** with an error message instead of crashing.
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhooks:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Use the printed **webhook signing secret** as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

3. In production, add an HTTPS endpoint `https://<your-domain>/api/stripe/webhook` and select at least **`checkout.session.completed`**.

Checkout sends `metadata.supabase_user_id` and `client_reference_id` so the webhook can match the Supabase user.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Middleware requires Supabase public env vars for all matched routes.

### 6. Supabase & Stripe CLI (verify setup)

**Supabase**

- Repo is **linked** to the cloud project when `supabase projects list` shows a **●** next to **Vocalia** (project ref is stored under `supabase/.temp/`, which is gitignored).
- Config lives in **`supabase/config.toml`**. Local stack (`supabase start`) is optional; `supabase status` only works when Docker is running that stack.
- **Hosted DB** schema/seed: keep using **`db/schema.sql`** and **`db/seed.sql`** in the Supabase SQL Editor (source of truth for migrations today). For **`supabase db reset`** locally, seed is wired to **`../db/seed.sql`** from `config.toml`.
- Regenerate TypeScript types from the linked project:

  ```bash
  npm run supabase:types
  ```

  Review **`types/database.generated.ts`** and merge into **`types/database.ts`** when you are ready (the app currently uses the hand-written `Database` type).

**Stripe**

- Run `stripe login` once so the CLI is paired with your account (`stripe config --list` shows the default profile).
- Local webhooks (while `npm run dev` is on port 3000):

  ```bash
  npm run stripe:listen
  ```

  Put the printed `whsec_...` value into **`.env.local`** as **`STRIPE_WEBHOOK_SECRET`** (this secret is only for the CLI forwarder, not the Dashboard webhook used in production).

**Upgrade CLIs (recommended)**

```bash
brew upgrade supabase stripe
```

## Database schema

Authoritative DDL lives in **`db/schema.sql`**. Main tables:

- **`profiles`** — `has_paid_access`, `stripe_customer_id`, …
- **`levels`** — CEFR `code`, `lesson_count` (denormalized for unpaid dashboard; update when you add/remove lessons)
- **`lessons`**, **`phrases`** — curriculum
- **`user_lesson_progress`**, **`user_phrase_progress`** — per-user progress
- **`payments`** — Stripe checkout audit trail

## Seed data

**`db/seed.sql`** wipes curriculum tables (`DELETE` order: phrases → lessons → levels) and re-inserts illustrative **European Portuguese** content for Americans in Portugal. It is **not** linguistic canon — replace over time.

Re-run any time in dev after you tweak copy (note: deleting phrases/lessons cascades linked progress rows).

## Editing curriculum (no admin CMS yet)

1. **Levels** — Insert/update `levels` (`code`, `title`, `description`, `sort_order`, **`lesson_count`**).
2. **Lessons** — Insert into `lessons` with `level_id`, `title`, `description`, `sort_order`, `is_published`.
3. **Phrases** — Insert into `phrases` with `lesson_id`, copy fields, `sort_order`.
4. **Audio** — Set `phrases.audio_url` to any HTTPS URL (Supabase Storage, CDN, etc.). The lesson UI renders an `<audio>` element when the column is non-null.

Easiest workflow for small edits: duplicate a block in **`db/seed.sql`**, adjust text, and run the script in the SQL editor. For production, prefer migrations (Supabase CLI or SQL files in CI).

## Deploy

- **Vercel** (recommended): connect the repo, set all env vars, deploy. Set Supabase redirect URLs and Stripe webhook URL to production.
- Ensure **`NEXT_PUBLIC_APP_URL`** matches the deployed origin so post-checkout redirects and magic links stay consistent.

## MVP limitations (by design)

Not included yet (structure allows adding them later):

- Speech recognition or pronunciation scoring
- Native recording pipeline / CMS for bulk audio
- Full admin CMS
- Additional languages/dialects (only European Portuguese seed track)
- App Store clients
- Social/community, streaks, badges

## Next features to build

- **Subscriptions** — second Stripe Price + webhook handling for `customer.subscription.updated` / `deleted`
- **Supabase Storage** — upload WAV/MP3 per phrase; keep `audio_url` in sync via Edge Function or admin script
- **Regenerate types** — `supabase gen types typescript` and replace `types/database.ts` to remove manual casts in `lib/progress.ts`
- **Email templates** — branded Supabase auth emails
- **Admin** — internal dashboard or Notion-driven content until a real CMS exists

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## License

Private / unlicensed by default — set a license when you publish.
