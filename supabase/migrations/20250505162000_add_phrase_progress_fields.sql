-- Add phrase progress fields expected by the app (legacy DBs may predate these columns).
-- Safe to run multiple times.

alter table public.user_phrase_progress
  add column if not exists is_saved boolean not null default false;

alter table public.user_phrase_progress
  add column if not exists speaking_confidence integer;

-- Normalize null booleans if an older column allowed nulls
update public.user_phrase_progress
set is_saved = false
where is_saved is null;

alter table public.user_phrase_progress
  alter column is_saved set default false;

alter table public.user_phrase_progress
  alter column is_saved set not null;

-- Clear out-of-range values so the CHECK can be applied safely (does not delete rows)
update public.user_phrase_progress
set speaking_confidence = null
where speaking_confidence is not null
  and (speaking_confidence < 1 or speaking_confidence > 5);

-- Idempotent CHECK: only when unset or between 1 and 5
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
