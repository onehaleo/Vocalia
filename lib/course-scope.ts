import { DEFAULT_COURSE_SLUG } from "@/lib/constants";
import type { createClient } from "@/lib/supabase/server";
import type { CourseRow, LevelRow } from "@/types/curriculum";

export type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Resolves the product course + levels even when the DB course slug does not match
 * `DEFAULT_COURSE_SLUG` (e.g. older seeds or renamed slugs). Falls back to whichever
 * `course_id` owns the first `levels` row so the dashboard stays aligned with real data.
 */
export async function resolveProductCatalog(
  client: SupabaseServer,
): Promise<{ course: CourseRow | null; levels: LevelRow[] }> {
  const { data: slugCourse } = await client.from("courses").select("*").eq("slug", DEFAULT_COURSE_SLUG).maybeSingle();

  let course = (slugCourse as CourseRow | null) ?? null;
  let levels: LevelRow[] = [];

  if (course) {
    const { data } = await client
      .from("levels")
      .select("*")
      .eq("course_id", course.id)
      .order("sort_order", { ascending: true });
    levels = (data ?? []) as LevelRow[];
  }

  if (!levels.length) {
    const { data: pivot } = await client
      .from("levels")
      .select("course_id")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    const cid = (pivot as { course_id: string } | null)?.course_id;
    if (cid) {
      const { data: c2 } = await client.from("courses").select("*").eq("id", cid).maybeSingle();
      course = (c2 as CourseRow | null) ?? course;
      const { data: lv2 } = await client
        .from("levels")
        .select("*")
        .eq("course_id", cid)
        .order("sort_order", { ascending: true });
      levels = (lv2 ?? []) as LevelRow[];
    }
  }

  if (levels.length && !course) {
    const cid = levels[0].course_id;
    const { data: c3 } = await client.from("courses").select("*").eq("id", cid).maybeSingle();
    course = c3 as CourseRow | null;
  }

  return { course, levels };
}

/** Published lessons whose module belongs to one of the given levels (stable totals vs dashboard cards). */
export async function countPublishedLessonsForLevels(
  client: SupabaseServer,
  levels: LevelRow[],
): Promise<number> {
  if (!levels.length) return 0;
  const levelIds = levels.map((l) => l.id);
  const { data: mods } = await client.from("modules").select("id").in("level_id", levelIds);
  const moduleIds = (mods ?? []).map((m) => (m as { id: string }).id);
  if (!moduleIds.length) return 0;
  const { count } = await client
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .in("module_id", moduleIds)
    .eq("is_published", true);
  return count ?? 0;
}
