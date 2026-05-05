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

## Environments (local, staging, production)

| | **Local** | **Staging** | **Production (beta)** |
|---|-----------|-------------|------------------------|
| **URL** | `http://localhost:3000` | `https://staging.speakvocalia.com` | `https://beta.speakvocalia.com` |
| **Git** | feature branches | `staging` branch → Vercel **Preview** (assign domain) | `main` → Vercel **Production** |
| **Stripe** | **Test** (`pk_test_` / `sk_test_`) | **Test** | **Live** (`pk_live_` / `sk_live_`) |
| **Supabase** | Staging / dev project (recommended) | Same staging / dev project | **Production** project (isolated) |
| **`NEXT_PUBLIC_APP_ENV`** | `local` | `staging` | `production` |

**Rules:** Do not put `SUPABASE_SERVICE_ROLE_KEY` or Stripe secrets in `NEXT_PUBLIC_*`. On **`next start`** / Vercel with `NODE_ENV=production`, the app runs **`validateDeploymentEnvOrThrow`** (`instrumentation.ts` → **`lib/env.ts`**) so `NEXT_PUBLIC_APP_URL` matches `NEXT_PUBLIC_APP_ENV`, and Stripe key prefixes match (test vs live). **`next dev`** skips that hook unless you set **`FORCE_ENV_VALIDATION=1`**. For builds or CI without secrets, use **`SKIP_ENV_VALIDATION=1`** (never in production). Manual check: **`npm run check:env`** (loads `.env.local` via Node’s parser when you run `node --env-file=.env.local scripts/check-env.mjs`, or plain `npm run check:env` after exporting vars).

**Note:** The apex domain **speakvocalia.com** is not repurposed in this doc; it can later point at a marketing site or redirect to `beta.speakvocalia.com`—do that in DNS / Vercel only after an explicit decision.

## Local setup

### 1. Clone and install

```bash
cd Vocalia
npm install
```

### 2. Environment variables

Copy the example file and fill in values (never commit `.env.local`):

```bash
cp .env.example .env.local
```

| Variable | Client-safe | Purpose |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_ENV` | Yes | `local` \| `staging` \| `production` — used for validation |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical origin, no trailing slash (must match the table above for each env) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon (publishable) key. Alternative name: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` if the older name is already in use. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key — `pk_test_` (local/staging) or `pk_live_` (production) |
| `SUPABASE_SERVICE_ROLE_KEY` | **No** — server only | Webhook + profile repair; **never** expose to the browser |
| `STRIPE_SECRET_KEY` | **No** | `sk_test_` or `sk_live_` |
| `STRIPE_WEBHOOK_SECRET` | **No** | Dashboard webhook signing secret, or `whsec_…` from `stripe listen` locally |
| `STRIPE_PRICE_ID` | **No** | One-time price (`price_…`) or product (`prod_…`) — Checkout uses `mode=payment` |

**Validation:** See **`lib/env.ts`** (`validateDeploymentEnvOrThrow`). **`lib/supabase/admin.ts`** is server-only (service role).

**Assumption (MVP):** Checkout is **one-time** (`payment`). Subscriptions can be added later with `mode: subscription` and additional webhook events.

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run **`db/schema.sql`** end-to-end (extensions, tables, triggers, RLS).
3. Run **`db/seed.sql`** to load the course catalog (levels → modules → lessons → phrases → activities → sound lessons). Regenerate anytime with **`npm run seed:sql`** (runs `scripts/build_platform_seed.py`).
4. **Auth → URL configuration** (match your Supabase project to the app URL)
   - **Local:** Site URL `http://localhost:3000` — Redirect URLs include `http://localhost:3000/auth/callback`.
   - **Staging:** Site URL `https://staging.speakvocalia.com` — Redirect `https://staging.speakvocalia.com/auth/callback`.
   - **Production (beta):** Site URL `https://beta.speakvocalia.com` — Redirect `https://beta.speakvocalia.com/auth/callback`.
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
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli). Forward webhooks to the local API:

   ```bash
   npm run stripe:listen
   ```

   Use the printed **`whsec_…`** signing secret as **`STRIPE_WEBHOOK_SECRET`** in `.env.local`.

3. **Paid access after checkout** requires **`SUPABASE_SERVICE_ROLE_KEY`** in `.env.local` (Supabase → Settings → API → `service_role`). Without it, neither the Stripe webhook nor the post-checkout **session sync** on `/dashboard` can set `profiles.has_paid_access`. After paying, you land on `/dashboard?payment=success&session_id=…` (legacy `checkout=success` still works); the app verifies the session with Stripe when the service role key is present.

4. **Stripe webhooks (Dashboard → Developers → Webhooks)** — create endpoints per mode:
   - **Staging (Stripe test mode):** `https://staging.speakvocalia.com/api/stripe/webhook`
   - **Production (Stripe live mode):** `https://beta.speakvocalia.com/api/stripe/webhook`  
   Subscribe at least to **`checkout.session.completed`**.

Checkout sends `metadata.userId`, `metadata.supabase_user_id`, and `client_reference_id` so the webhook can match the Supabase user.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Middleware requires Supabase public env vars for all matched routes.

### 6. Supabase & Stripe CLI (verify setup)

**Supabase CLI**

```bash
supabase login
# Staging / dev (example — use your project ref from the Supabase dashboard):
supabase link --project-ref YOUR_STAGING_PROJECT_REF
supabase db push
```

- **Production:** link with **`YOUR_PRODUCTION_PROJECT_REF`** when you intend to push migrations to prod (review diff first). **Do not** run `supabase db reset` on production unless you intend to wipe data.
- Repo **linked** state: `supabase projects list` shows **●** next to the linked project (ref under `supabase/.temp/`, gitignored).
- **`supabase/config.toml`** — local Docker stack is optional. **`[db.seed]`** points at **`../db/seed.sql`**; migrations run before seed on **`supabase db reset`**.
- **Hosted SQL (manual):** run **`db/schema.sql`** then **`db/seed.sql`** in the SQL Editor if you are not using CLI push.
- **Destructive local refresh:** `supabase start` then **`supabase db reset`** or **`npm run supabase:db:reset`**.

Regenerate types:

```bash
npm run supabase:types
```

**Stripe CLI (local webhook testing)**

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a **`whsec_…`** signing secret — put it in **`.env.local`** as **`STRIPE_WEBHOOK_SECRET`** for local testing only (Dashboard endpoints use the endpoint signing secrets shown in **Developers → Webhooks** for staging/production URLs).

**Test checkout flow:** run **`npm run dev`**, run **`stripe listen`** in another terminal, complete checkout with a [Stripe test card](https://stripe.com/docs/testing), confirm the webhook updates **`profiles.has_paid_access`** in Supabase.

**Upgrade CLIs (recommended)**

```bash
brew upgrade supabase stripe
```

### 7. Vercel environment variables (CLI examples)

Log in: `vercel login`. From the repo root, link if needed: `vercel link`.

**Production** (assign **`beta.speakvocalia.com`** to the Production deployment of `main`):

```bash
vercel env add NEXT_PUBLIC_APP_ENV production
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRICE_ID production
```

**Staging / Preview** (use the **Preview** scope for the `staging` branch; attach **`staging.speakvocalia.com`** as a branch domain in Vercel):

```bash
vercel env add NEXT_PUBLIC_APP_ENV preview
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add STRIPE_SECRET_KEY preview
vercel env add STRIPE_WEBHOOK_SECRET preview
vercel env add STRIPE_PRICE_ID preview
```

Set **`NEXT_PUBLIC_APP_ENV=staging`** and **`NEXT_PUBLIC_APP_URL=https://staging.speakvocalia.com`** (Preview). Use **Stripe test** keys and the **staging** Supabase project.

Pull env locally (creates/updates `.env.local` — do not commit):

```bash
npm run env:pull
```

**Any change to Vercel env vars requires a new deployment** to take effect.

### 8. Release workflow (recommended)

1. Work on a **feature** branch.
2. Merge into **`staging`**, push **`origin staging`**.
3. Open **`https://staging.speakvocalia.com`** — run a **Stripe test** checkout; confirm Supabase staging **`profiles.has_paid_access`** updates.
4. Merge **`staging`** into **`main`**, push **`origin main`**.
5. Open **`https://beta.speakvocalia.com`** — smoke-test **live** Stripe (use a small charge; **refund** test payments in the Stripe Dashboard if needed).
6. Confirm production Supabase reflects the payment.

**Git examples**

```bash
git checkout -b staging
git push origin staging

git checkout staging
git merge feature-branch
git push origin staging

git checkout main
git merge staging
git push origin main
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

### Troubleshooting: “No course found. Run db/seed.sql in Supabase.”

Confirm all of the following:

- **`db/schema.sql`** has been applied to this Supabase project.
- **`db/seed.sql`** has been run in the SQL Editor **without errors** (a failed batch can leave `courses` / `levels` empty).
- **`db/seed.sql`** does not contain invalid UUID literals. UUIDs may only use hex digits **`0-9`** and **`a-f`**. Regenerate the file with **`npm run seed:sql`** after pulling the latest **`scripts/build_platform_seed.py`**.
- Tables **`public.courses`** and **`public.levels`** contain rows after the seed.
- The deployed app’s **`NEXT_PUBLIC_SUPABASE_URL`** (Vercel env or `.env.local`) points at the **same** Supabase project where you ran the seed.

Verification queries (SQL editor):

```sql
select count(*) as courses from public.courses;
select count(*) as levels from public.levels;
select count(*) as modules from public.modules;
select count(*) as lessons from public.lessons;
select count(*) as phrases from public.phrases;

select id, slug, title from public.courses;
```

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

## Deploy (Vercel)

- Connect the GitHub/GitLab repo to **Vercel**.
- **Production (`main`):** assign **`beta.speakvocalia.com`** under Project → **Domains**; set Production env vars (live Stripe + production Supabase).
- **Staging:** create/use branch **`staging`**, assign **`staging.speakvocalia.com`** as a **Preview** or branch domain; set Preview env vars (test Stripe + staging Supabase).
- **`NEXT_PUBLIC_APP_URL`** must match the deployment URL for that environment (see **Environments** table above).

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
| `npm run env:pull` | `vercel env pull .env.local` (requires `vercel login` / linked project) |
| `npm run check:env` | Validates `.env.local` rules (prefixes, required keys; **never prints secrets**) |
| `npm run stripe:listen` | Stripe CLI → forward webhooks to local `/api/stripe/webhook` |
| `npm run seed:sql` | Regenerate `db/seed.sql` from `scripts/build_platform_seed.py` |
| `npm run supabase:db:reset` | Local Supabase DB reset (destructive) |

## License

Private / unlicensed by default — set a license when you publish.
