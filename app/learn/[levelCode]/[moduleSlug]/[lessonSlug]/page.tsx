import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getLessonPageBundle } from "@/lib/learning";
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

  const listenActs = activities.filter((a) => a.activity_type === "listen_placeholder");
  const otherActs = activities.filter((a) => a.activity_type !== "listen_placeholder");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6 sm:pb-12 sm:pt-14">
      <div className="flex flex-col gap-2">
        <Link
          href={`/learn/${level.code}`}
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          ← {level.code} · {mod.title}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{lesson.title}</h1>
        {lesson.description ? (
          <p className="mt-2 text-[var(--color-ink-muted)]">{lesson.description}</p>
        ) : null}
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Learn</h2>
        <Card className="space-y-3 text-sm leading-relaxed text-[var(--color-ink)]">
          {lesson.learn_excerpt ? <p>{lesson.learn_excerpt}</p> : (
            <p className="text-[var(--color-ink-muted)]">Short explanation will appear here when the lesson has a learn excerpt.</p>
          )}
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Listen</h2>
        <Card className="space-y-4">
          <AudioPlaceholderBar label="Lesson audio overview" />
          {listenActs.length === 0 ? (
            <p className="text-sm text-[var(--color-ink-muted)]">No scripted listen activity for this lesson yet.</p>
          ) : (
            listenActs.map((a) => <ActivityRenderer key={a.id} activity={a} />)
          )}
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Repeat</h2>
        <p className="text-sm text-[var(--color-ink-muted)]">Say each line aloud at a calm pace — quality over speed.</p>
        {phrases.length === 0 ? (
          <Card className="text-sm text-[var(--color-ink-muted)]">No phrases for this lesson yet.</Card>
        ) : (
          phrases.map((phrase) => (
            <PhrasePracticeCard
              key={phrase.id}
              phrase={phrase}
              progress={phraseProgress.get(phrase.id) ?? null}
              paths={path}
              showAudioRow
            />
          ))
        )}
      </section>

      {otherActs.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Guided practice</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Typed and multiple-choice checks run in the browser. Answers are compared to the seeded key — no AI scoring.
          </p>
          <div className="space-y-4">
            {otherActs.map((a) => (
              <div key={a.id}>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                  {skillSection(a.skill)}
                </p>
                <ActivityRenderer activity={a} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Speak</h2>
        <Card className="text-sm text-[var(--color-ink-muted)]">
          Read a phrase aloud, then use the self-check buttons on each card above (confidence 1–5). Speech recognition and
          pronunciation scoring are not part of this MVP.
        </Card>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Review</h2>
        <Card className="text-sm text-[var(--color-ink-muted)]">
          Mark phrases as needs practice, practicing, or mastered on the cards. Saved lines and statuses feed your{" "}
          <Link href="/review" className="font-medium text-[var(--color-accent)] hover:underline">
            Review
          </Link>{" "}
          queue.
        </Card>
      </section>

      <LessonStickyFooter lessonId={lesson.id} paths={{ ...path, lessonId: lesson.id }} alreadyCompleted={alreadyCompleted} />
    </main>
  );
}
