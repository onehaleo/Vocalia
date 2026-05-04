import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LessonRow, LevelRow, PhraseRow } from "@/types/curriculum";
import { PhrasePracticeCard } from "@/components/curriculum/phrase-practice-card";
import { LessonStickyFooter } from "@/components/curriculum/lesson-sticky-footer";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) {
    redirect("/login");
  }
  if (!profile?.has_paid_access) {
    redirect("/dashboard");
  }

  const { lessonId } = await params;
  const supabase = await createClient();

  const { data: lessonRaw, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .maybeSingle();

  const lesson = lessonRaw as LessonRow | null;

  if (lessonError || !lesson || !lesson.is_published) {
    notFound();
  }

  const { data: levelRaw } = await supabase
    .from("levels")
    .select("code")
    .eq("id", lesson.level_id)
    .maybeSingle();

  const level = levelRaw as Pick<LevelRow, "code"> | null;

  if (!level) {
    notFound();
  }

  const { data: phrasesRaw } = await supabase
    .from("phrases")
    .select("*")
    .eq("lesson_id", lesson.id)
    .order("sort_order", { ascending: true });

  const phraseList = (phrasesRaw ?? []) as PhraseRow[];
  const phraseIds = phraseList.map((p) => p.id);

  const ulpPromise = supabase
    .from("user_lesson_progress")
    .select("status")
    .eq("lesson_id", lesson.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const uppPromise =
    phraseIds.length > 0
      ? supabase
          .from("user_phrase_progress")
          .select("phrase_id, status, practice_count")
          .in("phrase_id", phraseIds)
          .eq("user_id", user.id)
      : Promise.resolve({
          data: [] as {
            phrase_id: string;
            status: string;
            practice_count: number;
          }[],
        });

  const [{ data: uppsRaw }, { data: ulpRaw }] = await Promise.all([
    uppPromise,
    ulpPromise,
  ]);

  const upps = (uppsRaw ?? []) as {
    phrase_id: string;
    status: string;
    practice_count: number;
  }[];
  const ulp = ulpRaw as { status: string } | null;

  const uppMap = new Map(
    upps.map((u) => [u.phrase_id, { status: u.status, practice_count: u.practice_count }]),
  );

  const alreadyCompleted = ulp?.status === "completed";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href={`/levels/${level.code}`}
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            ← Level {level.code}
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            {lesson.title}
          </h1>
          {lesson.description ? (
            <p className="mt-3 text-[var(--color-ink-muted)]">{lesson.description}</p>
          ) : null}
        </div>
      </div>

      <section className="mt-10 space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Phrase practice</h2>
        {phraseList.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/15 bg-white px-4 py-8 text-center text-sm text-[var(--color-ink-muted)]">
            No phrases for this lesson yet. Add rows in <code className="rounded bg-black/[0.06] px-1">db/seed.sql</code>.
          </p>
        ) : (
          phraseList.map((phrase) => (
            <PhrasePracticeCard
              key={phrase.id}
              phrase={phrase}
              progress={uppMap.get(phrase.id) ?? null}
              lessonId={lesson.id}
              levelCode={level.code}
            />
          ))
        )}
      </section>

      <LessonStickyFooter
        lessonId={lesson.id}
        levelCode={level.code}
        alreadyCompleted={alreadyCompleted}
      />
    </main>
  );
}
