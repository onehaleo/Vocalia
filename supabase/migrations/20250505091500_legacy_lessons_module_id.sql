-- Bridge: legacy public.lessons with level_id but no module_id (CREATE TABLE IF NOT EXISTS kept the old shape).
-- Creates one placeholder module per lesson, wires module_id, drops level_id, then restores FK + index.

do $$
begin
  if to_regclass('public.lessons') is null then
    return;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'module_id'
  ) then
    execute 'create index if not exists lessons_module_id_idx on public.lessons (module_id)';
    return;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'lessons' and column_name = 'level_id'
  ) then
    raise exception 'legacy_lessons_module_id: add module_id manually or restore level_id — cannot auto-bridge';
  end if;

  if to_regclass('public.modules') is null then
    raise exception 'legacy_lessons_module_id: public.modules is missing';
  end if;

  alter table public.modules add column if not exists coming_soon boolean not null default false;

  alter table public.lessons add column module_id uuid;
  alter table public.lessons add column if not exists slug text;
  update public.lessons
  set slug = 'legacy-' || replace(id::text, '-', '')
  where slug is null or length(trim(slug)) = 0;

  insert into public.modules (id, level_id, slug, title, description, sort_order, coming_soon)
  select gen_random_uuid(), le.level_id, 'mig-' || le.id::text, coalesce(le.title, 'Lesson'), '', coalesce(le.sort_order, 0), false
  from public.lessons le
  where not exists (select 1 from public.modules m where m.slug = 'mig-' || le.id::text);

  update public.lessons le
  set module_id = m.id
  from public.modules m
  where m.slug = 'mig-' || le.id::text
    and le.module_id is null;

  alter table public.lessons alter column module_id set not null;
  alter table public.lessons alter column slug set not null;

  alter table public.lessons drop constraint if exists lessons_level_id_fkey;
  alter table public.lessons drop constraint if exists lessons_level_id_slug_key;
  alter table public.lessons drop column if exists level_id;

  alter table public.lessons drop constraint if exists lessons_module_id_fkey;
  alter table public.lessons
    add constraint lessons_module_id_fkey foreign key (module_id) references public.modules (id) on delete cascade;

  execute 'create unique index if not exists lessons_module_id_slug_key on public.lessons (module_id, slug)';

  execute 'create index if not exists lessons_module_id_idx on public.lessons (module_id)';
end $$;
