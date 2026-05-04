import { createClient } from "@/lib/supabase/server";
import { resolveProductCatalog } from "@/lib/course-scope";
import type {
  ActivityRow,
  CourseRow,
  LessonRow,
  LevelRow,
  ModuleRow,
  PhraseRow,
  SoundLessonRow,
} from "@/types/curriculum";
import type { Database } from "@/types/database";

type PhraseProgressRow = Database["public"]["Tables"]["user_phrase_progress"]["Row"];

export type LessonPath = {
  levelCode: string;
  moduleSlug: string;
  lessonSlug: string;
};

export type PhraseWithLessonContext = PhraseRow & {
  levelCode: string;
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
};

export type ModuleWithLessons = {
  module: ModuleRow;
  lessons: Pick<LessonRow, "id" | "slug" | "title" | "description" | "sort_order">[];
  completedLessonIds: Set<string>;
  hasPracticeLessonIds: Set<string>;
};

export type LearnLevelBlock = {
  level: LevelRow;
  modules: ModuleWithLessons[];
};

export async function getLearnPathForUser(
  userId: string,
  hasPaidAccess: boolean,
): Promise<{ course: CourseRow; levels: LearnLevelBlock[] } | null> {
  const supabase = await createClient();
  const { course, levels } = await resolveProductCatalog(supabase);
  if (!course || !levels.length) return null;

  const levelIds = levels.map((l) => l.id);
  const { data: modulesRaw } = await supabase
    .from("modules")
    .select("*")
    .in("level_id", levelIds)
    .order("sort_order", { ascending: true });

  const modules = (modulesRaw ?? []) as ModuleRow[];
  const moduleIds = modules.map((m) => m.id);

  let lessons: LessonRow[] = [];
  if (moduleIds.length) {
    const { data: lessonsRaw } = await supabase
      .from("lessons")
      .select("*")
      .in("module_id", moduleIds)
      .eq("is_published", true)
      .order("sort_order", { ascending: true });
    lessons = (lessonsRaw ?? []) as LessonRow[];
  }

  const lessonsByModule = new Map<string, LessonRow[]>();
  for (const les of lessons) {
    const arr = lessonsByModule.get(les.module_id) ?? [];
    arr.push(les);
    lessonsByModule.set(les.module_id, arr);
  }

  const lessonIds = lessons.map((l) => l.id);
  const ulpMap = new Map<string, string>();
  const practicedLessonIds = new Set<string>();

  if (hasPaidAccess && lessonIds.length) {
    const [{ data: ulpRows }, { data: phraseRows }, { data: uppRows }] = await Promise.all([
      supabase.from("user_lesson_progress").select("lesson_id, status").in("lesson_id", lessonIds).eq("user_id", userId),
      supabase.from("phrases").select("id, lesson_id").in("lesson_id", lessonIds),
      supabase.from("user_phrase_progress").select("phrase_id").eq("user_id", userId),
    ]);
    for (const r of ulpRows ?? []) {
      ulpMap.set((r as { lesson_id: string; status: string }).lesson_id, (r as { status: string }).status);
    }
    const practicedPhrases = new Set((uppRows ?? []).map((u) => (u as { phrase_id: string }).phrase_id));
    const phraseToLesson = new Map((phraseRows ?? []).map((p) => [(p as { id: string }).id, (p as { lesson_id: string }).lesson_id]));
    for (const pid of practicedPhrases) {
      const lid = phraseToLesson.get(pid);
      if (lid) practicedLessonIds.add(lid);
    }
  }

  const modulesByLevel = new Map<string, ModuleRow[]>();
  for (const m of modules) {
    const arr = modulesByLevel.get(m.level_id) ?? [];
    arr.push(m);
    modulesByLevel.set(m.level_id, arr);
  }

  const blocks: LearnLevelBlock[] = levels.map((level) => {
    const modList = modulesByLevel.get(level.id) ?? [];
    const enriched: ModuleWithLessons[] = modList.map((mod) => {
      const modLessons = lessonsByModule.get(mod.id) ?? [];
      const completedLessonIds = new Set<string>();
      const hasPracticeLessonIds = new Set<string>();
      for (const les of modLessons) {
        if (ulpMap.get(les.id) === "completed") completedLessonIds.add(les.id);
        if (practicedLessonIds.has(les.id)) hasPracticeLessonIds.add(les.id);
      }
      return {
        module: mod,
        lessons: modLessons.map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          description: l.description,
          sort_order: l.sort_order,
        })),
        completedLessonIds,
        hasPracticeLessonIds,
      };
    });
    return { level, modules: enriched };
  });

  return { course, levels: blocks };
}

export async function resolveLessonPathById(lessonId: string): Promise<LessonPath | null> {
  const supabase = await createClient();
  const { data: lessonRaw } = await supabase
    .from("lessons")
    .select("slug, module_id, modules!inner(slug, level_id, levels!inner(code))")
    .eq("id", lessonId)
    .maybeSingle();

  if (!lessonRaw) return null;
  const row = lessonRaw as {
    slug: string;
    modules: { slug: string; levels: { code: string } };
  };
  return {
    lessonSlug: row.slug,
    moduleSlug: row.modules.slug,
    levelCode: row.modules.levels.code,
  };
}

export async function getLessonPageBundle(
  levelCode: string,
  moduleSlug: string,
  lessonSlug: string,
  userId: string,
) {
  const supabase = await createClient();
  const code = levelCode.toUpperCase();

  const { data: levelRaw } = await supabase.from("levels").select("*").eq("code", code).maybeSingle();
  const level = levelRaw as LevelRow | null;
  if (!level) return null;

  const { data: moduleRaw } = await supabase
    .from("modules")
    .select("*")
    .eq("level_id", level.id)
    .eq("slug", moduleSlug)
    .maybeSingle();
  const mod = moduleRaw as ModuleRow | null;
  if (!mod) return null;

  const { data: lessonRaw } = await supabase
    .from("lessons")
    .select("*")
    .eq("module_id", mod.id)
    .eq("slug", lessonSlug)
    .maybeSingle();
  const lesson = lessonRaw as LessonRow | null;
  if (!lesson || !lesson.is_published) return null;

  const [{ data: phrasesRaw }, { data: activitiesRaw }, { data: ulpRaw }] = await Promise.all([
    supabase.from("phrases").select("*").eq("lesson_id", lesson.id).order("sort_order", { ascending: true }),
    supabase.from("activities").select("*").eq("lesson_id", lesson.id).order("sort_order", { ascending: true }),
    supabase.from("user_lesson_progress").select("status").eq("lesson_id", lesson.id).eq("user_id", userId).maybeSingle(),
  ]);

  const phrases = (phrasesRaw ?? []) as PhraseRow[];
  const activities = (activitiesRaw ?? []) as ActivityRow[];
  const phraseIds = phrases.map((p) => p.id);

  const { data: uppRaw } =
    phraseIds.length > 0
      ? await supabase
          .from("user_phrase_progress")
          .select("phrase_id, status, practice_count, is_saved, speaking_confidence")
          .in("phrase_id", phraseIds)
          .eq("user_id", userId)
      : { data: [] as PhraseProgressRow[] };

  const uppMap = new Map(
    (uppRaw ?? []).map((u) => {
      const r = u as Pick<
        PhraseProgressRow,
        "phrase_id" | "status" | "practice_count" | "is_saved" | "speaking_confidence"
      >;
      return [r.phrase_id, r];
    }),
  );

  return {
    level,
    module: mod,
    lesson,
    phrases,
    activities,
    phraseProgress: uppMap,
    lessonProgress: (ulpRaw as { status: string } | null)?.status ?? null,
    path: { levelCode: level.code, moduleSlug: mod.slug, lessonSlug: lesson.slug } satisfies LessonPath,
  };
}

export async function getSoundLessons(): Promise<SoundLessonRow[]> {
  const supabase = await createClient();
  const { course } = await resolveProductCatalog(supabase);
  if (!course) return [];
  const { data } = await supabase
    .from("sound_lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("sort_order", { ascending: true });
  return (data ?? []) as SoundLessonRow[];
}

export async function getPhrasesForPractice(
  hasPaidAccess: boolean,
  skillFilter: string | null,
  limit = 40,
): Promise<PhraseWithLessonContext[]> {
  if (!hasPaidAccess) return [];
  const supabase = await createClient();
  const { course } = await resolveProductCatalog(supabase);
  if (!course) return [];

  const { data: phraseNested } = await supabase
    .from("phrases")
    .select(
      `
      *,
      lessons!inner (
        id, slug, title, is_published,
        modules!inner (
          slug,
          levels!inner ( code, course_id )
        )
      )
    `,
    )
    .eq("lessons.is_published", true)
    .eq("lessons.modules.levels.course_id", course.id)
    .limit(limit * 3);

  type Nested = PhraseRow & {
    lessons: {
      id: string;
      slug: string;
      title: string;
      modules: { slug: string; levels: { code: string } };
    };
  };

  const rows = (phraseNested ?? []) as Nested[];
  let skillLessonIds: Set<string> | null = null;
  if (skillFilter && skillFilter !== "all") {
    const { data: actRows } = await supabase.from("activities").select("lesson_id").eq("skill", skillFilter);
    skillLessonIds = new Set((actRows ?? []).map((a) => (a as { lesson_id: string }).lesson_id));
  }

  const out: PhraseWithLessonContext[] = [];
  for (const row of rows) {
    if (skillLessonIds && !skillLessonIds.has(row.lessons.id)) continue;
    const { lessons: L, ...phrase } = row;
    out.push({
      ...phrase,
      levelCode: L.modules.levels.code,
      moduleSlug: L.modules.slug,
      lessonSlug: L.slug,
      lessonTitle: L.title,
    });
    if (out.length >= limit) break;
  }
  return out;
}

export type DictionaryRow = PhraseRow & {
  levelCode: string;
  moduleSlug: string;
  lessonSlug: string;
};

export async function getDictionaryRows(
  hasPaidAccess: boolean,
  query: string,
  limit = 80,
): Promise<DictionaryRow[]> {
  if (!hasPaidAccess) return [];
  const supabase = await createClient();
  const { course } = await resolveProductCatalog(supabase);
  if (!course) return [];

  const q = query.trim();
  let req = supabase
    .from("phrases")
    .select(
      `
      *,
      lessons!inner (
        slug, title,
        modules!inner (
          slug,
          levels!inner ( code, course_id )
        )
      )
    `,
    )
    .eq("lessons.is_published", true)
    .eq("lessons.modules.levels.course_id", course.id)
    .order("phrase", { ascending: true })
    .limit(limit);

  if (q.length > 0) {
    req = req.or(`phrase.ilike.%${q}%,translation.ilike.%${q}%`);
  }

  const { data } = await req;
  type N = PhraseRow & {
    lessons: { slug: string; modules: { slug: string; levels: { code: string } } };
  };
  return (data ?? []).map((row) => {
    const r = row as N;
    const { lessons: L, ...phrase } = r;
    return {
      ...phrase,
      levelCode: L.modules.levels.code,
      moduleSlug: L.modules.slug,
      lessonSlug: L.slug,
    };
  });
}

export type ReviewItem = {
  progress: Pick<
    PhraseProgressRow,
    "phrase_id" | "status" | "practice_count" | "is_saved" | "speaking_confidence" | "last_practiced_at"
  >;
  phrase: PhraseRow;
  levelCode: string;
  moduleSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  skillHint: string;
};

export async function getReviewItems(userId: string, hasPaidAccess: boolean): Promise<ReviewItem[]> {
  if (!hasPaidAccess) return [];
  const supabase = await createClient();

  const { data: upp } = await supabase
    .from("user_phrase_progress")
    .select("phrase_id, status, practice_count, is_saved, speaking_confidence, last_practiced_at")
    .eq("user_id", userId);

  const uppList = (upp ?? []) as Pick<
    PhraseProgressRow,
    "phrase_id" | "status" | "practice_count" | "is_saved" | "speaking_confidence" | "last_practiced_at"
  >[];
  const phraseIds = uppList.map((u) => u.phrase_id);
  if (!phraseIds.length) return [];

  const { data: phraseNested } = await supabase
    .from("phrases")
    .select(
      `
      *,
      lessons!inner (
        slug, title,
        modules!inner (
          slug,
          levels!inner ( code )
        )
      )
    `,
    )
    .in("id", phraseIds);

  type PN = PhraseRow & {
    lessons: { slug: string; title: string; modules: { slug: string; levels: { code: string } } };
  };

  const phraseMap = new Map<string, PN>();
  for (const row of (phraseNested ?? []) as PN[]) {
    phraseMap.set(row.id, row);
  }

  const { data: actRows } = await supabase.from("activities").select("lesson_id, skill").in("lesson_id", [
    ...new Set([...phraseMap.values()].map((p) => p.lesson_id)),
  ]);

  const firstSkillByLesson = new Map<string, string>();
  for (const a of actRows ?? []) {
    const ar = a as { lesson_id: string; skill: string };
    if (!firstSkillByLesson.has(ar.lesson_id)) firstSkillByLesson.set(ar.lesson_id, ar.skill);
  }

  const items: ReviewItem[] = [];
  for (const pr of uppList) {
    const p = phraseMap.get(pr.phrase_id);
    if (!p) continue;
    items.push({
      progress: pr,
      phrase: {
        id: p.id,
        lesson_id: p.lesson_id,
        phrase: p.phrase,
        translation: p.translation,
        phonetic: p.phonetic,
        syllable_breakdown: p.syllable_breakdown,
        pronunciation_notes: p.pronunciation_notes,
        common_mistakes: p.common_mistakes,
        tags: p.tags,
        audio_url: p.audio_url,
        audio_slow_url: p.audio_slow_url,
        audio_natural_url: p.audio_natural_url,
        audio_context_url: p.audio_context_url,
        sort_order: p.sort_order,
        created_at: p.created_at,
      },
      levelCode: p.lessons.modules.levels.code,
      moduleSlug: p.lessons.modules.slug,
      lessonSlug: p.lessons.slug,
      lessonTitle: p.lessons.title,
      skillHint: firstSkillByLesson.get(p.lesson_id) ?? "reading",
    });
  }
  return items;
}

export type ProgressDashboard = {
  overallLessonRatio: number;
  completedLessons: number;
  totalLessons: number;
  byLevel: { code: string; title: string; done: number; total: number }[];
  skills: { skill: string; completed: number; available: number }[];
  masteredPhrases: number;
  needsPracticePhrases: number;
  savedPhrases: number;
};

export async function getProgressDashboard(userId: string, hasPaidAccess: boolean): Promise<ProgressDashboard | null> {
  if (!hasPaidAccess) {
    return {
      overallLessonRatio: 0,
      completedLessons: 0,
      totalLessons: 0,
      byLevel: [],
      skills: [],
      masteredPhrases: 0,
      needsPracticePhrases: 0,
      savedPhrases: 0,
    };
  }
  const supabase = await createClient();
  const path = await getLearnPathForUser(userId, true);
  if (!path) return null;

  let completedLessons = 0;
  let totalLessons = 0;
  const byLevel: ProgressDashboard["byLevel"] = [];

  for (const block of path.levels) {
    let done = 0;
    let tot = 0;
    for (const m of block.modules) {
      tot += m.lessons.length;
      done += m.completedLessonIds.size;
    }
    totalLessons += tot;
    completedLessons += done;
    byLevel.push({ code: block.level.code, title: block.level.title, done, total: tot });
  }

  const [{ count: mastered }, { count: needs }, { count: saved }, lessonsInCourse] = await Promise.all([
    supabase.from("user_phrase_progress").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("status", "mastered"),
    supabase
      .from("user_phrase_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "needs_practice"),
    supabase.from("user_phrase_progress").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_saved", true),
    supabase
      .from("lessons")
      .select("id, modules!inner(levels!inner(course_id))")
      .eq("is_published", true)
      .eq("modules.levels.course_id", path.course.id),
  ]);

  const lessonRows = (lessonsInCourse.data ?? []) as { id: string }[];
  const courseLessonIds = lessonRows.map((l) => l.id);

  let skills: ProgressDashboard["skills"] = [];
  if (courseLessonIds.length) {
    const [{ data: allActs }, { data: attRows }] = await Promise.all([
      supabase.from("activities").select("id, skill").in("lesson_id", courseLessonIds),
      supabase.from("user_activity_attempts").select("activity_id").eq("user_id", userId).eq("correct", true),
    ]);
    const acts = (allActs ?? []) as { id: string; skill: string }[];
    const correctIds = new Set((attRows ?? []).map((a) => (a as { activity_id: string }).activity_id));
    const availableBy = new Map<string, Set<string>>();
    const doneBy = new Map<string, Set<string>>();
    for (const a of acts) {
      if (!availableBy.has(a.skill)) availableBy.set(a.skill, new Set());
      availableBy.get(a.skill)!.add(a.id);
      if (correctIds.has(a.id)) {
        if (!doneBy.has(a.skill)) doneBy.set(a.skill, new Set());
        doneBy.get(a.skill)!.add(a.id);
      }
    }
    skills = [...availableBy.keys()].map((skill) => ({
      skill,
      completed: doneBy.get(skill)?.size ?? 0,
      available: availableBy.get(skill)?.size ?? 0,
    }));
  }

  return {
    overallLessonRatio: totalLessons > 0 ? completedLessons / totalLessons : 0,
    completedLessons,
    totalLessons,
    byLevel,
    skills,
    masteredPhrases: mastered ?? 0,
    needsPracticePhrases: needs ?? 0,
    savedPhrases: saved ?? 0,
  };
}
