"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { Database, Json } from "@/types/database";

type PhraseProgRow = Database["public"]["Tables"]["user_phrase_progress"]["Row"];
type LessonProgInsert = Database["public"]["Tables"]["user_lesson_progress"]["Insert"];

export type LessonRevalidatePaths = {
  levelCode: string;
  moduleSlug: string;
  lessonSlug: string;
  /** Legacy `/lessons/[id]` route */
  lessonId?: string;
};

function revalidateLessonSurface(paths: LessonRevalidatePaths) {
  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath(`/learn/${paths.levelCode}`);
  revalidatePath(`/learn/${paths.levelCode}/${paths.moduleSlug}/${paths.lessonSlug}`);
  revalidatePath("/review");
  revalidatePath("/progress");
  revalidatePath("/practice");
  revalidatePath("/dictionary");
  if (paths.lessonId) {
    revalidatePath(`/lessons/${paths.lessonId}`);
    revalidatePath(`/levels/${paths.levelCode}`);
  }
}

async function requirePaidUser() {
  const { user, profile } = await getProfile();
  if (!user) {
    throw new Error("You must be signed in.");
  }
  if (!profile?.has_paid_access) {
    throw new Error("Vocalia access is required to update progress.");
  }
  return user;
}

async function fetchPhraseProgDefaults(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  phraseId: string,
) {
  const { data } = await supabase
    .from("user_phrase_progress")
    .select("practice_count, is_saved, speaking_confidence, status, last_practiced_at")
    .eq("user_id", userId)
    .eq("phrase_id", phraseId)
    .maybeSingle();
  return data as
    | Pick<
        PhraseProgRow,
        "practice_count" | "is_saved" | "speaking_confidence" | "status" | "last_practiced_at"
      >
    | null;
}

export async function markPhraseNeedsPractice(phraseId: string, paths: LessonRevalidatePaths) {
  const user = await requirePaidUser();
  const supabase = await createClient();
  const existing = await fetchPhraseProgDefaults(supabase, user.id, phraseId);
  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: "needs_practice",
    practice_count: (existing?.practice_count ?? 0) + 1,
    is_saved: existing?.is_saved ?? false,
    speaking_confidence: existing?.speaking_confidence ?? null,
    last_practiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });
  if (error) throw new Error(error.message);
  revalidateLessonSurface(paths);
}

export async function markPhrasePracticing(phraseId: string, paths: LessonRevalidatePaths) {
  const user = await requirePaidUser();
  const supabase = await createClient();
  const existing = await fetchPhraseProgDefaults(supabase, user.id, phraseId);
  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: "practicing",
    practice_count: (existing?.practice_count ?? 0) + 1,
    is_saved: existing?.is_saved ?? false,
    speaking_confidence: existing?.speaking_confidence ?? null,
    last_practiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });
  if (error) throw new Error(error.message);
  revalidateLessonSurface(paths);
}

export async function markPhraseMastered(phraseId: string, paths: LessonRevalidatePaths) {
  const user = await requirePaidUser();
  const supabase = await createClient();
  const existing = await fetchPhraseProgDefaults(supabase, user.id, phraseId);
  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: "mastered",
    practice_count: (existing?.practice_count ?? 0) + 1,
    is_saved: existing?.is_saved ?? false,
    speaking_confidence: existing?.speaking_confidence ?? null,
    last_practiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });
  if (error) throw new Error(error.message);
  revalidateLessonSurface(paths);
}

export async function togglePhraseSaved(phraseId: string, paths: LessonRevalidatePaths) {
  const user = await requirePaidUser();
  const supabase = await createClient();
  const existing = await fetchPhraseProgDefaults(supabase, user.id, phraseId);
  const nextSaved = !(existing?.is_saved ?? false);
  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: existing?.status ?? "new",
    practice_count: existing?.practice_count ?? 0,
    is_saved: nextSaved,
    speaking_confidence: existing?.speaking_confidence ?? null,
    last_practiced_at: existing?.last_practiced_at ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });
  if (error) throw new Error(error.message);
  revalidateLessonSurface(paths);
}

export async function setPhraseSpeakingConfidence(
  phraseId: string,
  confidence: number,
  paths: LessonRevalidatePaths,
) {
  const user = await requirePaidUser();
  const supabase = await createClient();
  const existing = await fetchPhraseProgDefaults(supabase, user.id, phraseId);
  const clamped = Math.min(5, Math.max(1, Math.round(confidence)));
  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: existing?.status ?? "practicing",
    practice_count: existing?.practice_count ?? 0,
    is_saved: existing?.is_saved ?? false,
    speaking_confidence: clamped,
    last_practiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });
  if (error) throw new Error(error.message);
  revalidateLessonSurface(paths);
}

export async function recordActivityAttempt(
  activityId: string,
  correct: boolean,
  response: Json | null,
) {
  const user = await requirePaidUser();
  const supabase = await createClient();
  const { error } = await supabase.from("user_activity_attempts").insert({
    user_id: user.id,
    activity_id: activityId,
    correct,
    response,
  } as never);
  if (error) throw new Error(error.message);
  revalidatePath("/progress");
  revalidatePath("/practice");
}

export async function markLessonComplete(lessonId: string, paths: LessonRevalidatePaths) {
  const user = await requirePaidUser();
  const supabase = await createClient();

  const lessonRow: LessonProgInsert = {
    user_id: user.id,
    lesson_id: lessonId,
    status: "completed",
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_lesson_progress")
    .upsert([lessonRow] as never, { onConflict: "user_id,lesson_id" });

  if (error) throw new Error(error.message);
  revalidateLessonSurface(paths);
}
