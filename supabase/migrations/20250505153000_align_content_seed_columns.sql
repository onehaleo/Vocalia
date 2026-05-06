-- Align legacy content tables with expanded A1 seed requirements.
-- Safe to run multiple times.

alter table public.lessons add column if not exists description text;
alter table public.lessons add column if not exists learn_excerpt text;
alter table public.lessons add column if not exists is_published boolean not null default true;

alter table public.phrases add column if not exists tags text[] not null default '{}';
alter table public.phrases add column if not exists sort_order integer not null default 1;

alter table public.modules add column if not exists coming_soon boolean not null default false;
alter table public.levels add column if not exists lesson_count integer not null default 0;

-- If columns existed before this migration but allowed NULLs, normalize values first.
update public.lessons
set is_published = true
where is_published is null;

update public.phrases
set tags = '{}'
where tags is null;

update public.phrases
set sort_order = 1
where sort_order is null;

update public.modules
set coming_soon = false
where coming_soon is null;

update public.levels
set lesson_count = 0
where lesson_count is null;

alter table public.lessons alter column is_published set default true;
alter table public.lessons alter column is_published set not null;

alter table public.phrases alter column tags set default '{}';
alter table public.phrases alter column tags set not null;
alter table public.phrases alter column sort_order set default 1;
alter table public.phrases alter column sort_order set not null;

alter table public.modules alter column coming_soon set default false;
alter table public.modules alter column coming_soon set not null;

alter table public.levels alter column lesson_count set default 0;
alter table public.levels alter column lesson_count set not null;
