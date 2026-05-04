-- Vocalia — Supabase schema (profiles, payments, learning catalog, progress)
-- Local CLI: applied before db/seed.sql on `supabase start` / `supabase db reset`.
-- Source of truth for edits: db/schema.sql — copy here when the schema changes.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Auth extension: profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  has_paid_access boolean not null default false,
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.profiles_self_update_guard()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt()->>'role', '') is distinct from 'service_role' then
    new.has_paid_access := old.has_paid_access;
    new.stripe_customer_id := old.stripe_customer_id;
    new.id := old.id;
    new.created_at := old.created_at;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_self_update_guard on public.profiles;
create trigger profiles_self_update_guard
  before update on public.profiles
  for each row execute function public.profiles_self_update_guard();

-- ---------------------------------------------------------------------------
-- Catalog: languages → courses → levels → modules → lessons → phrases
-- ---------------------------------------------------------------------------
create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null references public.languages (id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  code text not null,
  title text not null,
  path_label text,
  description text,
  sort_order integer not null,
  lesson_count integer not null default 0,
  unique (course_id, code)
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  sort_order integer not null,
  coming_soon boolean not null default false,
  unique (level_id, slug)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  learn_excerpt text,
  sort_order integer not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.phrases (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  phrase text not null,
  translation text not null,
  phonetic text not null,
  syllable_breakdown text,
  pronunciation_notes text,
  common_mistakes text,
  tags text[] default '{}',
  audio_url text,
  audio_slow_url text,
  audio_natural_url text,
  audio_context_url text,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  activity_type text not null,
  title text not null,
  skill text not null default 'reading',
  config jsonb not null default '{}'::jsonb,
  sort_order integer not null
);

create table if not exists public.sound_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  slug text not null unique,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  sort_order integer not null
);

-- ---------------------------------------------------------------------------
-- Progress & attempts
-- ---------------------------------------------------------------------------
create table if not exists public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  status text not null default 'not_started',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.user_phrase_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  phrase_id uuid not null references public.phrases (id) on delete cascade,
  status text not null default 'new',
  practice_count integer not null default 0,
  is_saved boolean not null default false,
  speaking_confidence smallint,
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, phrase_id)
);

create table if not exists public.user_activity_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  activity_id uuid not null references public.activities (id) on delete cascade,
  correct boolean not null,
  response jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill text not null,
  activities_completed integer not null default 0,
  activities_available integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, skill)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text,
  stripe_checkout_session_id text,
  amount_total integer,
  currency text,
  status text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists levels_course_id_idx on public.levels (course_id);
create index if not exists modules_level_id_idx on public.modules (level_id);
create index if not exists lessons_module_id_idx on public.lessons (module_id);
create index if not exists phrases_lesson_id_idx on public.phrases (lesson_id);
create index if not exists activities_lesson_id_idx on public.activities (lesson_id);
create index if not exists user_lesson_progress_user_idx on public.user_lesson_progress (user_id);
create index if not exists user_phrase_progress_user_idx on public.user_phrase_progress (user_id);
create index if not exists user_activity_attempts_user_idx on public.user_activity_attempts (user_id);
create index if not exists user_skill_progress_user_idx on public.user_skill_progress (user_id);
create index if not exists payments_user_id_idx on public.payments (user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.languages enable row level security;
alter table public.courses enable row level security;
alter table public.levels enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.phrases enable row level security;
alter table public.activities enable row level security;
alter table public.sound_lessons enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.user_phrase_progress enable row level security;
alter table public.user_activity_attempts enable row level security;
alter table public.user_skill_progress enable row level security;
alter table public.payments enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "languages_select_auth" on public.languages;
create policy "languages_select_auth"
  on public.languages for select to authenticated using (true);

drop policy if exists "courses_select_auth" on public.courses;
create policy "courses_select_auth"
  on public.courses for select to authenticated using (true);

drop policy if exists "levels_select_auth" on public.levels;
create policy "levels_select_auth"
  on public.levels for select to authenticated using (true);

drop policy if exists "modules_select_paid" on public.modules;
drop policy if exists "modules_select_auth" on public.modules;
create policy "modules_select_auth"
  on public.modules for select to authenticated using (true);

drop policy if exists "lessons_select_paid" on public.lessons;
drop policy if exists "lessons_select_auth" on public.lessons;
create policy "lessons_select_auth"
  on public.lessons for select to authenticated
  using (is_published);

drop policy if exists "phrases_select_paid" on public.phrases;
create policy "phrases_select_paid"
  on public.phrases for select to authenticated
  using (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.profiles p on p.id = auth.uid()
      where l.id = lesson_id and l.is_published = true and p.has_paid_access = true
    )
  );

drop policy if exists "activities_select_paid" on public.activities;
create policy "activities_select_paid"
  on public.activities for select to authenticated
  using (
    exists (
      select 1 from public.lessons l
      join public.profiles p on p.id = auth.uid()
      where l.id = lesson_id and l.is_published = true and p.has_paid_access = true
    )
  );

drop policy if exists "sound_lessons_select_paid" on public.sound_lessons;
drop policy if exists "sound_lessons_select_auth" on public.sound_lessons;
create policy "sound_lessons_select_auth"
  on public.sound_lessons for select to authenticated using (true);

drop policy if exists "ulp_select_own" on public.user_lesson_progress;
create policy "ulp_select_own" on public.user_lesson_progress for select to authenticated using (auth.uid() = user_id);
drop policy if exists "ulp_insert_own" on public.user_lesson_progress;
create policy "ulp_insert_own" on public.user_lesson_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "ulp_update_own" on public.user_lesson_progress;
create policy "ulp_update_own" on public.user_lesson_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "upp_select_own" on public.user_phrase_progress;
create policy "upp_select_own" on public.user_phrase_progress for select to authenticated using (auth.uid() = user_id);
drop policy if exists "upp_insert_own" on public.user_phrase_progress;
create policy "upp_insert_own" on public.user_phrase_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "upp_update_own" on public.user_phrase_progress;
create policy "upp_update_own" on public.user_phrase_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "uaa_select_own" on public.user_activity_attempts;
create policy "uaa_select_own" on public.user_activity_attempts for select to authenticated using (auth.uid() = user_id);
drop policy if exists "uaa_insert_own" on public.user_activity_attempts;
create policy "uaa_insert_own" on public.user_activity_attempts for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "usp_select_own" on public.user_skill_progress;
create policy "usp_select_own" on public.user_skill_progress for select to authenticated using (auth.uid() = user_id);
drop policy if exists "usp_insert_own" on public.user_skill_progress;
create policy "usp_insert_own" on public.user_skill_progress for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "usp_update_own" on public.user_skill_progress;
create policy "usp_update_own" on public.user_skill_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
