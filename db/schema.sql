-- Vocalia MVP schema — run in Supabase SQL Editor (or supabase db push)
-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
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

-- CEFR levels (lesson_count is denormalized for unpaid dashboard preview)
create table if not exists public.levels (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  sort_order integer not null,
  lesson_count integer not null default 0
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  level_id uuid not null references public.levels (id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
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
  audio_url text,
  sort_order integer not null,
  created_at timestamptz not null default now()
);

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
  last_practiced_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, phrase_id)
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

create index if not exists lessons_level_id_idx on public.lessons (level_id);
create index if not exists phrases_lesson_id_idx on public.phrases (lesson_id);
create index if not exists user_lesson_progress_user_idx on public.user_lesson_progress (user_id);
create index if not exists user_phrase_progress_user_idx on public.user_phrase_progress (user_id);
create index if not exists payments_user_id_idx on public.payments (user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.levels enable row level security;
alter table public.lessons enable row level security;
alter table public.phrases enable row level security;
alter table public.user_lesson_progress enable row level security;
alter table public.user_phrase_progress enable row level security;
alter table public.payments enable row level security;

-- Profiles: own row read; own row update (protected columns via trigger)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Levels: any signed-in user (metadata + lesson_count for dashboard)
drop policy if exists "levels_select_auth" on public.levels;
create policy "levels_select_auth"
  on public.levels for select
  to authenticated
  using (true);

-- Lessons / phrases: paid + published only
drop policy if exists "lessons_select_paid" on public.lessons;
create policy "lessons_select_paid"
  on public.lessons for select
  to authenticated
  using (
    is_published
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.has_paid_access = true
    )
  );

drop policy if exists "phrases_select_paid" on public.phrases;
create policy "phrases_select_paid"
  on public.phrases for select
  to authenticated
  using (
    exists (
      select 1 from public.lessons l
      where l.id = lesson_id and l.is_published = true
    )
    and exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.has_paid_access = true
    )
  );

-- Progress: own rows only
drop policy if exists "ulp_select_own" on public.user_lesson_progress;
create policy "ulp_select_own"
  on public.user_lesson_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "ulp_insert_own" on public.user_lesson_progress;
create policy "ulp_insert_own"
  on public.user_lesson_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ulp_update_own" on public.user_lesson_progress;
create policy "ulp_update_own"
  on public.user_lesson_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "upp_select_own" on public.user_phrase_progress;
create policy "upp_select_own"
  on public.user_phrase_progress for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "upp_insert_own" on public.user_phrase_progress;
create policy "upp_insert_own"
  on public.user_phrase_progress for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "upp_update_own" on public.user_phrase_progress;
create policy "upp_update_own"
  on public.user_phrase_progress for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Payments: no client access (webhook uses service role)
drop policy if exists "payments_no_client" on public.payments;
-- intentionally no policies for authenticated — only service role bypasses RLS
