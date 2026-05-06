"use client";

import { useCallback, useState } from "react";
import type { ActivityRow } from "@/types/curriculum";
import type { LessonRevalidatePaths } from "@/lib/progress";
import type { Database } from "@/types/database";
import { PhrasePracticeCard } from "@/components/curriculum/phrase-practice-card";
import { LessonStickyFooter } from "@/components/curriculum/lesson-sticky-footer";
import { ActivityRenderer } from "@/components/learning/activity-renderer";
import { AudioPlaceholderBar } from "@/components/learning/audio-placeholders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";

type PhraseRow = Database["public"]["Tables"]["phrases"]["Row"];
type PhraseProg = Pick<
  Database["public"]["Tables"]["user_phrase_progress"]["Row"],
  "status" | "practice_count" | "is_saved" | "speaking_confidence"
> | null;

function skillSection(skill: string) {
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
}

function PhraseCarousel({
  phrases,
  phraseProgressById,
  paths,
}: {
  phrases: PhraseRow[];
  phraseProgressById: Record<string, PhraseProg>;
  paths: LessonRevalidatePaths;
}) {
  const [index, setIndex] = useState(0);
  const safeIndex = phrases.length ? Math.min(index, phrases.length - 1) : 0;
  const phrase = phrases[safeIndex];

  const go = useCallback(
    (next: number) => {
      if (phrases.length === 0) return;
      const clamped = Math.max(0, Math.min(phrases.length - 1, next));
      setIndex(clamped);
    },
    [phrases.length],
  );

  if (phrases.length === 0) {
    return <Card className="text-sm text-[var(--color-ink-muted)]">No phrases for this lesson yet.</Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-[var(--color-ink)]">
          Phrase {safeIndex + 1} of {phrases.length}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={safeIndex === 0}
            onClick={() => go(safeIndex - 1)}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            disabled={safeIndex >= phrases.length - 1}
            onClick={() => go(safeIndex + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Jump to phrase">
        {phrases.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === safeIndex}
            onClick={() => go(i)}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm font-medium transition",
              i === safeIndex
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]/50 text-[var(--color-accent)]"
                : "border-black/[0.08] bg-white text-[var(--color-ink-muted)] hover:border-black/15",
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <PhrasePracticeCard
        key={phrase.id}
        phrase={phrase}
        progress={phraseProgressById[phrase.id] ?? null}
        paths={paths}
      />
    </div>
  );
}

export function LessonPracticeClient({
  phrases,
  phraseProgressById,
  paths,
  listenActs,
  otherActs,
  lessonId,
  alreadyCompleted,
  phraseCount,
  activityCount,
  nextLessonHref,
  nextLessonTitle,
}: {
  phrases: PhraseRow[];
  phraseProgressById: Record<string, PhraseProg>;
  paths: LessonRevalidatePaths;
  listenActs: ActivityRow[];
  otherActs: ActivityRow[];
  lessonId: string;
  alreadyCompleted: boolean;
  phraseCount: number;
  activityCount: number;
  nextLessonHref?: string;
  nextLessonTitle?: string;
}) {
  const [repeatKey, setRepeatKey] = useState(0);
  const repeatLesson = () => setRepeatKey((k) => k + 1);

  return (
    <>
      <section className="mt-10 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Phrase practice</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            One phrase at a time. Take your time — you can go back and repeat any step.
          </p>
        </div>
        <PhraseCarousel
          key={repeatKey}
          phrases={phrases}
          phraseProgressById={phraseProgressById}
          paths={paths}
        />
      </section>

      <section className="mt-12 space-y-6 border-t border-black/[0.06] pt-10">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Guided practice</h2>
          <p className="text-sm text-[var(--color-ink-muted)]">
            Short steps after your phrase practice. Same checks as before — calmer layout.
          </p>
        </div>

        {listenActs.length > 0 ? (
          <Card className="space-y-4 border-black/[0.06] bg-black/[0.015] p-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">Step 1 · Listen</p>
              <p className="mt-1 text-sm text-[var(--color-ink)]">Listen once, then repeat slowly.</p>
            </div>
            <AudioPlaceholderBar label="Lesson audio overview" />
            <div className="space-y-4 pt-1">
              {listenActs.map((a) => (
                <ActivityRenderer key={a.id} activity={a} showSkillBadge={false} />
              ))}
            </div>
          </Card>
        ) : null}

        {otherActs.length > 0 ? (
          <div className="space-y-6">
            {otherActs.map((a, index) => (
              <Card key={a.id} className="space-y-3 border-black/[0.06] bg-black/[0.015] p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-black/[0.06] pb-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                    Step {listenActs.length > 0 ? index + 2 : index + 1} · {skillSection(a.skill)}
                  </p>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{a.skill}</span>
                </div>
                <ActivityRenderer activity={a} showSkillBadge={false} />
              </Card>
            ))}
          </div>
        ) : listenActs.length === 0 && otherActs.length === 0 ? (
          <Card className="text-sm text-[var(--color-ink-muted)]">No guided activities for this lesson yet.</Card>
        ) : null}
      </section>

      <section className="mt-12">
        <LessonStickyFooter
          lessonId={lessonId}
          paths={paths}
          alreadyCompleted={alreadyCompleted}
          phraseCount={phraseCount}
          activityCount={activityCount}
          nextLessonHref={nextLessonHref}
          nextLessonTitle={nextLessonTitle}
          onRepeatLesson={repeatLesson}
        />
      </section>
    </>
  );
}
