-- Ensure phrase cards support optional audio URLs on legacy databases.
-- Safe to run multiple times.

alter table public.phrases
  add column if not exists audio_url text;
