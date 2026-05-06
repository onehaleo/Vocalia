-- Vocalia — Supabase schema (profiles, payments, learning catalog, progress)
-- Run in Supabase SQL Editor (or supabase db push). Requires pgcrypto.

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
  tags text[] not null default '{}',
  audio_url text,
  audio_slow_url text,
  audio_natural_url text,
  audio_context_url text,
  sort_order integer not null default 1,
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
  speaking_confidence integer,
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, phrase_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    join pg_namespace n on t.relnamespace = n.oid
    where n.nspname = 'public'
      and t.relname = 'user_phrase_progress'
      and c.conname = 'user_phrase_progress_speaking_confidence_range'
  ) then
    alter table public.user_phrase_progress
      add constraint user_phrase_progress_speaking_confidence_range
      check (
        speaking_confidence is null
        or (speaking_confidence >= 1 and speaking_confidence <= 5)
      );
  end if;
end $$;

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
-- Legacy DBs may have public.levels without course_id (IF NOT EXISTS skipped the new table shape).
do $$
declare
  lang_id uuid;
  course_id_val uuid;
begin
  if to_regclass('public.levels') is null then
    return;
  end if;

  select id into lang_id from public.languages where code = 'pt' limit 1;
  if lang_id is null then
    insert into public.languages (id, code, name)
    values ('f0000001-0001-4001-8001-000000000001', 'pt', 'Portuguese (Portugal)')
    on conflict (code) do nothing;
    select id into lang_id from public.languages where code = 'pt' limit 1;
  end if;

  if lang_id is null then
    raise exception 'levels_course_id_legacy_bridge: could not resolve or create languages row for code pt';
  end if;

  select id into course_id_val from public.courses where slug = 'european-portuguese-beginners' limit 1;
  if course_id_val is null then
    insert into public.courses (id, language_id, slug, title, description)
    values (
      'f0000002-0002-4002-8002-000000000002',
      lang_id,
      'european-portuguese-beginners',
      'European Portuguese for English-speaking beginners',
      'First Vocalia course — vocabulary, grammar patterns, and real-life phrases with pronunciation support.'
    )
    on conflict (slug) do nothing;
    select id into course_id_val from public.courses where slug = 'european-portuguese-beginners' limit 1;
  end if;

  if course_id_val is null then
    raise exception 'levels_course_id_legacy_bridge: could not resolve or create course european-portuguese-beginners';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'levels' and column_name = 'course_id'
  ) then
    alter table public.levels add column course_id uuid;
  end if;

  alter table public.levels add column if not exists path_label text;
  alter table public.levels add column if not exists lesson_count integer not null default 0;

  update public.levels l
  set course_id = course_id_val
  where l.course_id is null;

  alter table public.levels alter column course_id set not null;

  alter table public.levels drop constraint if exists levels_course_id_fkey;
  alter table public.levels
    add constraint levels_course_id_fkey foreign key (course_id) references public.courses (id) on delete cascade;

  execute 'create unique index if not exists levels_course_id_code_key on public.levels (course_id, code)';
  execute 'create index if not exists levels_course_id_idx on public.levels (course_id)';
end $$;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'modules' and column_name = 'level_id') then
    execute 'create index if not exists modules_level_id_idx on public.modules (level_id)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'lessons' and column_name = 'module_id') then
    execute 'create index if not exists lessons_module_id_idx on public.lessons (module_id)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'phrases' and column_name = 'lesson_id') then
    execute 'create index if not exists phrases_lesson_id_idx on public.phrases (lesson_id)';
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'activities' and column_name = 'lesson_id') then
    execute 'create index if not exists activities_lesson_id_idx on public.activities (lesson_id)';
  end if;
end $$;

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
