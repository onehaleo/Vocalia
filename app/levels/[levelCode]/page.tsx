import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LessonRow, LevelRow } from "@/types/curriculum";
import { LessonListRow, type LessonRowModel } from "@/components/curriculum/lesson-row";
import { LinkButton } from "@/components/ui/button";

export default async function LevelPage({
  params,
}: {
  params: Promise<{ levelCode: string }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) {
    redirect("/login");
  }
  if (!profile?.has_paid_access) {
    redirect("/dashboard");
  }

  const { levelCode: raw } = await params;
  const levelCode = raw.toUpperCase();
  const supabase = await createClient();

  const { data: levelRaw, error: levelError } = await supabase
    .from("levels")
    .select("*")
    .eq("code", levelCode)
    .maybeSingle();

  const level = levelRaw as LevelRow | null;

  if (levelError || !level) {
    notFound();
  }

  const { data: lessonsRaw } = await supabase
    .from("lessons")
    .select("*")
    .eq("level_id", level.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  const lessonList = (lessonsRaw ?? []) as LessonRow[];
  const lessonIds = lessonList.map((l) => l.id);

  let ulps: { lesson_id: string; status: string }[] = [];
  let phraseRows: { id: string; lesson_id: string }[] = [];

  if (lessonIds.length > 0) {
    const [ulpRes, phraseRes] = await Promise.all([
      supabase
        .from("user_lesson_progress")
        .select("lesson_id, status")
        .in("lesson_id", lessonIds)
        .eq("user_id", user.id),
      supabase.from("phrases").select("id, lesson_id").in("lesson_id", lessonIds),
    ]);
    ulps = ulpRes.data ?? [];
    phraseRows = phraseRes.data ?? [];
  }
  const phraseIds = phraseRows.map((p) => p.id);
  const phraseToLesson = new Map(phraseRows.map((p) => [p.id, p.lesson_id]));

  const { data: upps } =
    phraseIds.length > 0
      ? await supabase
          .from("user_phrase_progress")
          .select("phrase_id")
          .in("phrase_id", phraseIds)
          .eq("user_id", user.id)
      : { data: [] as { phrase_id: string }[] };

  const practicedPhrases = new Set((upps ?? []).map((u) => u.phrase_id));
  const lessonHasPractice = new Map<string, boolean>();
  for (const pid of phraseIds) {
    if (practicedPhrases.has(pid)) {
      const lid = phraseToLesson.get(pid);
      if (lid) lessonHasPractice.set(lid, true);
    }
  }

  const ulpMap = new Map((ulps ?? []).map((u) => [u.lesson_id, u.status]));

  const rows: LessonRowModel[] = lessonList.map((lesson) => {
    const st = ulpMap.get(lesson.id);
    let status: LessonRowModel["status"] = "not_started";
    if (st === "completed") status = "completed";
    else if (lessonHasPractice.get(lesson.id)) status = "in_progress";
    return {
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      sort_order: lesson.sort_order,
      status,
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            {level.code}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            {level.title}
          </h1>
          {level.description ? (
            <p className="mt-3 text-[var(--color-ink-muted)]">{level.description}</p>
          ) : null}
        </div>
        <LinkButton href="/dashboard" variant="secondary" className="shrink-0 self-start">
          Dashboard
        </LinkButton>
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Lessons</h2>
        {rows.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            No published lessons for this level yet.
          </p>
        ) : (
          rows.map((lesson) => (
            <LessonListRow key={lesson.id} lesson={lesson} />
          ))
        )}
      </section>
    </main>
  );
}
