# Vocalia

Vocalia is a **mobile-first** web app for **first-time language learners** who want **European Portuguese** vocabulary, light grammar patterns, and real-life phrases with **pronunciation support** from day one. The MVP ships one guided **course** (CEFR-style path A1–B2 with modules and lessons), **Supabase** for auth and data, and **Stripe Checkout** for a **one-time** purchase (code is structured so **subscriptions** can be added later). The UI stays **calm and adult** — no gamification layer in this release.

## Tech stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** — Auth, Postgres, Row Level Security (storage is optional; phrases use `audio_url` text for hosted files)

Supabase clients live under **`utils/supabase/`** (browser + server + middleware session refresh), matching current Supabase docs. App code can keep importing **`@/lib/supabase/server`** (`await createClient()`), which delegates to `utils/supabase/server` with `await cookies()`.

Optional — Supabase Agent Skills for Cursor: `npx skills add supabase/agent-skills`

- **Stripe** — Checkout (`payment` mode) + webhooks to flip `profiles.has_paid_access`

## App structure (routes)

| Route | Description |
|-------|-------------|
| `/` | Marketing landing |
| `/pricing`, `/login`, `/signup` | Checkout funnel and auth |
| `/dashboard` | Account snapshot, checkout sync, level cards linking into **Learn** |
| **`/learn`** | Course home — CEFR levels, `path_label`, modules, lesson counts, progress bars |
| **`/learn/[levelCode]`** | Level path — modules and lessons (published lesson titles visible when signed in) |
| **`/learn/[levelCode]/[moduleSlug]/[lessonSlug]`** | Lesson experience — Learn / Listen / Repeat / guided activities / Speak / Review (**paid**; phrases + activities under RLS) |
| **`/practice`** | Skill modes + phrase pool filtered by `?skill=` query |
| **`/practice/pronunciation`** | **Pronunciation lab** — `sound_lessons` content (European Portuguese seed topics) |
| **`/review`** | Personal review queue with filters (level, skill, lesson, status) |
| **`/dictionary`** | Searchable phrase list (`?q=`) from course phrases |
| **`/progress`** | Progress dashboard — lessons, levels, skills (from activity attempts), phrase stats |
| `/levels/[levelCode]`, `/lessons/[lessonId]` | **Legacy redirects** → `/learn/...` canonical URLs |

**Navigation:** Signed-in users get **Learn · Practice · Review · Dictionary · Progress** in the header plus **Dashboard**.

**Key code:**

- **`lib/learning.ts`** — Course path, lesson bundles, dictionary, review list, practice pool, progress aggregates.
- **`lib/progress.ts`** — Server actions: phrase statuses (`needs_practice`, `practicing`, `mastered`), save toggle, speaking self-rating, lesson completion, activity attempts.
- **`lib/dashboard.ts`** — Dashboard level cards (counts lessons via `modules` → `levels`).
- **`lib/constants.ts`** — Default course slug `european-portuguese-beginners`.
- **`components/learning/`** — `ActivityRenderer` (seed-driven activities), `AudioPlaceholderBar`.
- **`components/curriculum/`** — `PhrasePracticeCard`, `LessonStickyFooter` (used on lesson pages).
- **`components/review/review-queue.tsx`** — Client-side filters for the review page.
- **`db/schema.sql`** — Full DDL + RLS.
- **`scripts/build_platform_seed.py`** + **`npm run seed:sql`** — Regenerates **`db/seed.sql`**.

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
| `NEXT_PUBLIC_APP_URL` | Canonical app origin (no trailing slash). **Production:** `https://speakvocalia.com`. **Local:** `http://localhost:3000`. Used for Stripe redirects, auth callbacks, and Open Graph `metadataBase`. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (reserved for future Elements; checkout still needs Stripe env on the server) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from the Stripe webhook endpoint |
| `STRIPE_PRICE_ID` | **One-time** Price ID (`mode=payment` in Checkout) |

**Assumption (MVP):** Checkout is **one-time** (`payment`). To add subscriptions later, create a recurring Price, switch Checkout `mode` to `subscription`, and extend the webhook to handle `customer.subscription.*` events (documented as a next step below).

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **`db/schema.sql`** end-to-end (extensions, tables, triggers, RLS).
3. Run **`db/seed.sql`** to load the course catalog (levels → modules → lessons → phrases → activities → sound lessons). Regenerate anytime with **`npm run seed:sql`** (runs `scripts/build_platform_seed.py`).
4. **Auth → URL configuration**
   - **Production:** **Site URL** `https://speakvocalia.com` — **Redirect URLs** include `https://speakvocalia.com/auth/callback`.
   - **Local:** Site URL can stay `http://localhost:3000` with redirect `http://localhost:3000/auth/callback`, or use separate Supabase projects for dev vs prod.
5. **Email auth**  
   For local dev you can disable “Confirm email” under Authentication settings so sign-up logs in immediately.

**Profiles:** New users get a row in `public.profiles` via the `on_auth_user_created` trigger. Paid fields and `stripe_customer_id` are only writable by the **service role** (webhook); normal users cannot flip `has_paid_access` thanks to the `profiles_self_update_guard` trigger.

**RLS summary:**

- `profiles` — users read/update own row (sensitive columns guarded by trigger).
- `languages`, `courses`, `levels`, **`modules`**, **`lessons`**, **`sound_lessons`** — any **authenticated** user can **read** (so the Learn path and pronunciation lab can show structure and lesson titles; **paid** is still required for phrase drills and activities).
- **`phrases`**, **`activities`** — read only if the user has **`has_paid_access`** and the parent lesson is published (phrases join lessons in policy).
- `user_lesson_progress`, `user_phrase_progress`, `user_activity_attempts`, `user_skill_progress` — users read/write **own** rows only (where policies exist).
- `payments` — **no** policy for `authenticated`; inserts/updates happen with the **service role** in the webhook (bypasses RLS).

**Course catalog resolution:** `lib/course-scope.ts` prefers `courses.slug = european-portuguese-beginners`. If that row is missing or has no levels, the app follows **`levels.course_id`** from the first level row so dashboard level cards and the “lessons completed” total stay aligned (avoids “0 levels” while lessons still exist).

### 4. Stripe setup

1. In the Stripe Dashboard, create a **Product** with a **one-time** price. In `.env.local`, set **`STRIPE_PRICE_ID`** to either the **Price** id (`price_…`, recommended) or the **Product** id (`prod_…`); if you use `prod_…`, Vocalia resolves the product’s default one-time price (or the first active one-time price). Subscription-only prices will fail: Checkout uses **`mode: "payment"`**. If `STRIPE_PRICE_ID` is missing, checkout redirects to **`/pricing`** with an error instead of crashing.
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhooks:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Use the printed **webhook signing secret** as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

3. **Paid access after checkout** requires **`SUPABASE_SERVICE_ROLE_KEY`** in `.env.local` (Supabase → Settings → API → `service_role`). Without it, neither the Stripe webhook nor the post-checkout **session sync** on `/dashboard` can set `profiles.has_paid_access`. After paying, you should land on `/dashboard?checkout=success&session_id=…`; the app verifies that session with Stripe and unlocks access when the service role key is present.

3. In production, add an HTTPS endpoint **`https://speakvocalia.com/api/stripe/webhook`** and select at least **`checkout.session.completed`**.

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

## Database schema (data model)

Authoritative DDL lives in **`db/schema.sql`**. Learning catalog and progress:

| Table | Purpose |
|-------|---------|
| **`languages`** | e.g. `pt` |
| **`courses`** | e.g. `european-portuguese-beginners` (`slug`, `title`, FK → `languages`) |
| **`levels`** | CEFR step within a course (`code`, `title`, **`path_label`**, `lesson_count`, FK → `courses`) |
| **`modules`** | Themed units within a level (`slug`, `title`, **`coming_soon`**) |
| **`lessons`** | `module_id`, **`slug`**, `title`, **`learn_excerpt`**, `is_published` |
| **`phrases`** | Portuguese line + English + phonetics + **`tags`[]** + **`audio_slow_url`**, **`audio_natural_url`**, **`audio_context_url`** (plus legacy **`audio_url`**) |
| **`activities`** | `lesson_id`, **`activity_type`**, `title`, **`skill`**, **`config` (jsonb)**, `sort_order` |
| **`sound_lessons`** | Pronunciation lab cards: `slug`, `title`, **`body` (jsonb)** (explanation, approximations, examples) |
| **`user_lesson_progress`** | `lesson_id`, `status`, `completed_at` |
| **`user_phrase_progress`** | `phrase_id`, **`status`**, **`is_saved`**, **`speaking_confidence`**, `practice_count`, … |
| **`user_activity_attempts`** | `activity_id`, `correct`, `response` (jsonb) — powers **Progress** skill bars |
| **`user_skill_progress`** | Reserved for future denormalized skill totals (optional; UI also derives from attempts) |
| **`profiles`**, **`payments`** | Auth profile + Stripe audit |

**URLs** use `levels.code`, `modules.slug`, and `lessons.slug` (stable links).

## Seed data

**`db/seed.sql`** is generated by **`npm run seed:sql`**. It clears catalog + user progress tables (dev-oriented) and inserts:

- **A1** — ten modules (Sound Foundations, Greetings, Introductions, Numbers & Time, Food & Cafés, Directions, Shopping, People & Family, Grammar Patterns, Survival Phrases) each with a starter lesson, phrases, and sample **`activities`**.
- **A2 / B1 / B2** — placeholder **`modules`** with **`coming_soon = true`**.
- **`sound_lessons`** — eight European Portuguese topics (nasal vowels, final -s, unstressed vowels, open/closed vowels, R, lh/nh, stress, rhythm).

Re-run in the Supabase SQL Editor after regenerating. **Warning:** aggressive `DELETE`s remove learner progress in dev — use migrations or a softer seed for production.

## How to add lessons

1. Ensure the **`modules`** row exists (`level_id`, unique `slug` per level).
2. **`INSERT`** into **`lessons`** with `module_id`, unique `slug` within that module, `title`, optional `description`, **`learn_excerpt`** (short “Learn” panel copy), `sort_order`, `is_published = true`.
3. Update **`levels.lesson_count`** if you use that denormalized field for dashboard previews (optional if you recompute from joins in app code).

## How to add activities

Insert into **`activities`** with:

- **`activity_type`** — one of: `multiple_choice`, `listen_placeholder`, `match_meaning`, `type_missing`, `translate_pt`, `rebuild_sentence`, `self_rate_speaking`, `pronunciation_confidence` (renderer in **`components/learning/activity-renderer.tsx`**).
- **`skill`** — `reading` \| `listening` \| `writing` \| `speaking` \| `pronunciation` (used for Practice filters and Progress grouping).
- **`config`** (jsonb) — shape per type, e.g.:
  - `multiple_choice`: `{ "prompt": "…", "options": ["…"], "correctIndex": 0 }`
  - `listen_placeholder`: `{ "label": "…" }`
  - `match_meaning`: `{ "pairs": [["PT","EN"], …] }`
  - `type_missing`: `{ "template": "_____ …", "answer": "…", "hint": "…" }`
  - `translate_pt`: `{ "prompt": "…", "answers": ["…", "…"] }` (normalized compare)
  - `rebuild_sentence`: `{ "tokens": ["…"], "answer": "full sentence" }`

## How to add audio later

- **Per phrase:** set **`phrases.audio_url`** for a single `<audio>` control, and/or **`audio_slow_url`**, **`audio_natural_url`**, **`audio_context_url`** once you host files (Supabase Storage, CDN, etc.). The lesson UI already shows **placeholder** buttons when URLs are null; swap placeholders for real `<audio>` or a player component when URLs exist.
- **Per lesson / activity:** extend **`activities.config`** with URL fields and teach **`listen_placeholder`** (or a new type) to render real players — the data layer is ready for extra keys without schema migrations.

Easiest workflow for small edits: adjust **`scripts/build_platform_seed.py`** and run **`npm run seed:sql`**, then paste the new **`db/seed.sql`** in the SQL editor. For production, prefer migrations (Supabase CLI or SQL in CI).

## Deploy

- **Vercel** (recommended): connect the repo, add the custom domain **`speakvocalia.com`** (and `www` if you use it) under Project → **Domains**, set **all env vars** (see commented block at top of **`.env.example`**), then deploy.
- Ensure **`NEXT_PUBLIC_APP_URL`** is **`https://speakvocalia.com`** (no trailing slash) on Vercel so post-checkout redirects, auth callbacks, and metadata stay consistent.

## MVP limitations (by design)

Not included in this release (the schema and UI hooks are meant to grow into these):

- **AI pronunciation scoring** or third-party speech grading
- **Real speech recognition** (user speech is not captured or analyzed)
- **Real audio files** in-repo (placeholders only until you set URLs)
- **Mobile app store** distribution (web only)
- **Full admin CMS** (SQL / seed script authoring for now)
- **Social features**, streaks, badges, leaderboards
- **Certified CEFR alignment** — levels are learning paths, not exam prep guarantees

## Recommended next features

- **Subscriptions** — second Stripe Price + webhook handling for `customer.subscription.updated` / `deleted`
- **Supabase Storage** — upload WAV/MP3 per phrase; populate `audio_*` columns; optional Edge Function to sync metadata
- **Regenerate types** — `npm run supabase:types` and merge **`types/database.generated.ts`** into **`types/database.ts`**
- **ASR + scoring pipeline** — new tables for attempts + provider keys; keep lesson UI behind feature flags
- **SRS / scheduling** — spaced repetition on top of `user_phrase_progress`
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
