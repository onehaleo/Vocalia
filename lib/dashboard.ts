import { createClient } from "@/lib/supabase/server";
import type { LessonRow, LevelRow } from "@/types/curriculum";

export type LevelCardModel = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  lessonCount: number;
  completedLessons: number;
};

export async function getLevelCardsForUser(
  userId: string,
  hasPaidAccess: boolean,
): Promise<LevelCardModel[]> {
  const supabase = await createClient();

  const { data: levelsRaw, error: levelsError } = await supabase
    .from("levels")
    .select("*")
    .order("sort_order", { ascending: true });

  const levels = (levelsRaw ?? []) as LevelRow[];

  if (levelsError || !levels.length) {
    return [];
  }

  if (!hasPaidAccess) {
    return levels.map((l) => ({
      id: l.id,
      code: l.code,
      title: l.title,
      description: l.description,
      lessonCount: l.lesson_count,
      completedLessons: 0,
    }));
  }

  const { data: lessonsRaw } = await supabase
    .from("lessons")
    .select("id, level_id")
    .eq("is_published", true);

  const lessons = (lessonsRaw ?? []) as Pick<LessonRow, "id" | "level_id">[];

  const { data: progressRowsRaw } = await supabase
    .from("user_lesson_progress")
    .select("lesson_id, status")
    .eq("user_id", userId)
    .eq("status", "completed");

  const progressRows = (progressRowsRaw ?? []) as { lesson_id: string; status: string }[];

  const completedSet = new Set(progressRows.map((r) => r.lesson_id));

  const countsByLevel = new Map<string, { total: number; done: number }>();
  for (const lv of levels) {
    countsByLevel.set(lv.id, { total: 0, done: 0 });
  }
  for (const les of lessons) {
    const cur = countsByLevel.get(les.level_id);
    if (!cur) continue;
    cur.total += 1;
    if (completedSet.has(les.id)) cur.done += 1;
  }

  return levels.map((l) => {
    const c = countsByLevel.get(l.id) ?? { total: 0, done: 0 };
    return {
      id: l.id,
      code: l.code,
      title: l.title,
      description: l.description,
      lessonCount: c.total > 0 ? c.total : l.lesson_count,
      completedLessons: c.done,
    };
  });
}

export async function getProgressSummary(userId: string, hasPaidAccess: boolean) {
  if (!hasPaidAccess) {
    return { completedLessons: 0, totalLessons: 0, masteredPhrases: 0 };
  }

  const supabase = await createClient();

  const [{ count: totalLessons }, { count: completedLessons }, { count: masteredPhrases }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true),
      supabase
        .from("user_lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "completed"),
      supabase
        .from("user_phrase_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "mastered"),
    ]);

  return {
    completedLessons: completedLessons ?? 0,
    totalLessons: totalLessons ?? 0,
    masteredPhrases: masteredPhrases ?? 0,
  };
}
