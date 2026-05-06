import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getLessonPageBundle } from "@/lib/learning";
import { createClient } from "@/lib/supabase/server";
import { LessonPracticeClient } from "@/components/lesson/phrase-practice-flow";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type PhraseProgPick = Pick<
  Database["public"]["Tables"]["user_phrase_progress"]["Row"],
  "status" | "practice_count" | "is_saved" | "speaking_confidence"
> | null;

export default async function LearnLessonPage({
  params,
}: {
  params: Promise<{ levelCode: string; moduleSlug: string; lessonSlug: string }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");
  if (!profile?.has_paid_access) {
    redirect("/pricing?from=paid-content");
  }

  const { levelCode: rawLc, moduleSlug, lessonSlug } = await params;
  const levelCode = rawLc.toUpperCase();

  const bundle = await getLessonPageBundle(levelCode, moduleSlug, lessonSlug, user.id);
  if (!bundle) notFound();

  const { level, module: mod, lesson, phrases, activities, phraseProgress, lessonProgress, path } = bundle;
  const alreadyCompleted = lessonProgress === "completed";

  const phraseProgressById: Record<string, PhraseProgPick> = {};
  for (const [id, v] of phraseProgress) {
    phraseProgressById[id] = v;
  }

  const supabase = await createClient();
  const { data: moduleLessonsRaw } = await supabase
    .from("lessons")
    .select("slug, title, sort_order")
    .eq("module_id", mod.id)
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  const moduleLessons = (moduleLessonsRaw ?? []) as { slug: string; title: string; sort_order: number }[];
  const lessonIndex = moduleLessons.findIndex((l) => l.slug === lesson.slug);
  const nextLesson = lessonIndex >= 0 ? moduleLessons[lessonIndex + 1] : undefined;
  const nextLessonHref = nextLesson ? `/learn/${level.code}/${mod.slug}/${nextLesson.slug}` : undefined;

  const listenActs = activities.filter((a) => a.activity_type === "listen_placeholder");
  const otherActs = activities.filter((a) => a.activity_type !== "listen_placeholder");

  const excerpt =
    lesson.learn_excerpt ?? lesson.description ?? "Calm, pronunciation-first practice for this lesson.";

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-8 sm:px-6 sm:pt-10">
      <div className="sticky top-0 z-20 -mx-4 border-b border-black/[0.06] bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-2">
          <Link
            href={`/learn/${level.code}`}
            className="text-sm font-medium text-[var(--color-accent)] hover:underline"
          >
            ← Back to {level.code} path
          </Link>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">{mod.title}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">{lesson.title}</h1>
          <p className="text-sm leading-relaxed text-[var(--color-ink-muted)]">{excerpt}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">
            <span className="font-medium text-[var(--color-ink)]">{phrases.length} phrases</span>
            {" · "}
            <span className="font-medium text-[var(--color-ink)]">{activities.length} activities</span>
            {" · "}
            Pronunciation-first practice (not certified instruction)
          </p>
          {alreadyCompleted ? (
            <span className="inline-flex w-fit rounded-full bg-[var(--color-accent-muted)] px-2.5 py-1 text-xs font-medium text-[var(--color-accent)]">
              Lesson complete
            </span>
          ) : null}
        </div>
      </div>

      <LessonPracticeClient
        phrases={phrases}
        phraseProgressById={phraseProgressById}
        paths={{ ...path, lessonId: lesson.id }}
        listenActs={listenActs}
        otherActs={otherActs}
        lessonId={lesson.id}
        alreadyCompleted={alreadyCompleted}
        phraseCount={phrases.length}
        activityCount={activities.length}
        nextLessonHref={nextLessonHref}
        nextLessonTitle={nextLesson?.title}
      />
    </main>
  );
}
