import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getLessonPageBundle } from "@/lib/learning";
import { createClient } from "@/lib/supabase/server";
import { PhrasePracticeCard } from "@/components/curriculum/phrase-practice-card";
import { LessonStickyFooter } from "@/components/curriculum/lesson-sticky-footer";
import { ActivityRenderer } from "@/components/learning/activity-renderer";
import { AudioPlaceholderBar } from "@/components/learning/audio-placeholders";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const skillSection = (skill: string) => {
  switch (skill) {
    case "listening":
      return "Listen";
    case "speaking":
      return "Speak";
    case "writing":
      return "Write";
    case "reading":
      return "Read";
    case "pronunciation":
      return "Pronunciation";
    default:
      return "Practice";
  }
};

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
  const masteredCount = phrases.filter((phrase) => phraseProgress.get(phrase.id)?.status === "mastered").length;

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
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">{lesson.title}</h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            {lesson.learn_excerpt ?? lesson.description ?? "Calm, pronunciation-first practice for this lesson."}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[var(--color-ink-muted)]">
              Progress: {masteredCount}/{phrases.length} phrases mastered
            </span>
            {alreadyCompleted ? (
              <span className="rounded-full bg-[var(--color-accent-muted)] px-2.5 py-1 font-medium text-[var(--color-accent)]">
                Lesson complete
              </span>
            ) : null}
            {nextLessonHref ? (
              <Link href={nextLessonHref} className="font-medium text-[var(--color-accent)] hover:underline">
                Next: {nextLesson?.title}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={`/learn/${level.code}`}
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          ← {level.code} · {mod.title}
        </Link>
        {lesson.description ? <p className="text-sm text-[var(--color-ink-muted)]">{lesson.description}</p> : null}
      </div>

      <section className="mt-6">
        <Card className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">Lesson overview</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            What you will practice: phrase meaning, building sentences, and pronunciation confidence.
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-black/[0.03] px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Phrases</p>
              <p className="mt-1 font-semibold text-[var(--color-ink)]">{phrases.length}</p>
            </div>
            <div className="rounded-xl bg-black/[0.03] px-3 py-2">
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Activities</p>
              <p className="mt-1 font-semibold text-[var(--color-ink)]">{activities.length}</p>
            </div>
            <div className="col-span-2 rounded-xl bg-[var(--color-accent-muted)]/45 px-3 py-2 sm:col-span-1">
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-muted)]">Reminder</p>
              <p className="mt-1 text-[var(--color-ink)]">Pronunciation-first practice, not certified instruction.</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Phrase practice</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Focus on one phrase at a time. Use “Show pronunciation details” when you need extra guidance.
          </p>
        </div>
        {phrases.length === 0 ? (
          <Card className="text-sm text-[var(--color-ink-muted)]">No phrases for this lesson yet.</Card>
        ) : (
          <div className="space-y-4">
            {phrases.map((phrase) => (
              <PhrasePracticeCard
                key={phrase.id}
                phrase={phrase}
                progress={phraseProgress.get(phrase.id) ?? null}
                paths={path}
                showAudioRow
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Guided practice</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Follow these steps in order. Keep a calm pace and focus on pronunciation clarity.
          </p>
        </div>
        {listenActs.length > 0 ? (
          <Card className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">Step 1 · Listen</p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">Listen once, then repeat slowly.</p>
            </div>
            <AudioPlaceholderBar label="Lesson audio overview" />
            {listenActs.map((a) => (
              <ActivityRenderer key={a.id} activity={a} showSkillBadge={false} />
            ))}
          </Card>
        ) : null}
        {otherActs.length > 0 ? (
          <div className="space-y-4">
            {otherActs.map((a, index) => (
              <div key={a.id} className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Step {listenActs.length > 0 ? index + 2 : index + 1}
                    {" · "}
                    {skillSection(a.skill)}
                  </p>
                  <p className="text-xs text-[var(--color-ink-muted)]">{a.skill}</p>
                </div>
                <ActivityRenderer activity={a} showSkillBadge={false} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-sm text-[var(--color-ink-muted)]">No guided activities for this lesson yet.</Card>
        )}
      </section>

      <section className="mt-10">
        <LessonStickyFooter
          lessonId={lesson.id}
          paths={{ ...path, lessonId: lesson.id }}
          alreadyCompleted={alreadyCompleted}
          phraseCount={phrases.length}
          activityCount={activities.length}
          nextLessonHref={nextLessonHref}
          nextLessonTitle={nextLesson?.title}
        />
      </section>
    </main>
  );
}
