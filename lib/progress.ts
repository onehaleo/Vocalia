"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import type { Database } from "@/types/database";

type PhraseProgRow = Database["public"]["Tables"]["user_phrase_progress"]["Row"];
type LessonProgInsert = Database["public"]["Tables"]["user_lesson_progress"]["Insert"];

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

export async function markPhrasePracticing(
  phraseId: string,
  paths: { lessonId: string; levelCode: string },
) {
  const user = await requirePaidUser();
  const supabase = await createClient();

  const { data: existingRaw } = await supabase
    .from("user_phrase_progress")
    .select("id, practice_count")
    .eq("user_id", user.id)
    .eq("phrase_id", phraseId)
    .maybeSingle();

  const existing = existingRaw as Pick<PhraseProgRow, "id" | "practice_count"> | null;

  const nextCount = (existing?.practice_count ?? 0) + 1;
  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: "practicing",
    practice_count: nextCount,
    last_practiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath(`/lessons/${paths.lessonId}`);
  revalidatePath(`/levels/${paths.levelCode}`);
}

export async function markPhraseMastered(
  phraseId: string,
  paths: { lessonId: string; levelCode: string },
) {
  const user = await requirePaidUser();
  const supabase = await createClient();

  const { data: existingRaw } = await supabase
    .from("user_phrase_progress")
    .select("practice_count")
    .eq("user_id", user.id)
    .eq("phrase_id", phraseId)
    .maybeSingle();

  const existing = existingRaw as Pick<PhraseProgRow, "practice_count"> | null;

  const row = {
    user_id: user.id,
    phrase_id: phraseId,
    status: "mastered",
    practice_count: (existing?.practice_count ?? 0) + 1,
    last_practiced_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_phrase_progress").upsert([row] as never, {
    onConflict: "user_id,phrase_id",
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath(`/lessons/${paths.lessonId}`);
  revalidatePath(`/levels/${paths.levelCode}`);
}

export async function markLessonComplete(lessonId: string, levelCode: string) {
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
  revalidatePath("/dashboard");
  revalidatePath(`/levels/${levelCode}`);
  revalidatePath(`/lessons/${lessonId}`);
}
