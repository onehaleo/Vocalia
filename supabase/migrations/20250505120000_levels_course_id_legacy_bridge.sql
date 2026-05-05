-- Bridge: legacy public.levels without course_id (CREATE TABLE IF NOT EXISTS skipped the new shape).
-- Ensures default language + course rows exist, then adds/backfills course_id before indexes.

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
