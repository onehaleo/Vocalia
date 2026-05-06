"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { LessonRevalidatePaths } from "@/lib/progress";
import { markLessonComplete } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export function LessonStickyFooter({
  lessonId,
  paths,
  alreadyCompleted,
  phraseCount,
  activityCount,
  nextLessonHref,
  nextLessonTitle,
}: {
  lessonId: string;
  paths: LessonRevalidatePaths;
  alreadyCompleted: boolean;
  phraseCount: number;
  activityCount: number;
  nextLessonHref?: string;
  nextLessonTitle?: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyCompleted);
  const [pending, startTransition] = useTransition();

  function complete() {
    setError(null);
    startTransition(async () => {
      try {
        await markLessonComplete(lessonId, paths);
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save progress.");
      }
    });
  }

  const backHref = `/learn/${paths.levelCode}`;

  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm shadow-black/[0.04]">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">Ready to wrap up?</h3>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {phraseCount} phrases and {activityCount} activities in this lesson.
          </p>
        </div>
        {done ? (
          <p className="text-sm font-medium text-[var(--color-accent)]">Lesson marked complete. Nice work.</p>
        ) : (
          <div className="space-y-2">
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="button" variant="primary" className="w-full sm:w-auto" disabled={pending} onClick={complete}>
              {pending ? "Saving…" : "Mark lesson complete"}
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link href={backHref} className="font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            ← Back to {paths.levelCode} path
          </Link>
          {nextLessonHref ? (
            <Link href={nextLessonHref} className="font-medium text-[var(--color-accent)] hover:underline">
              Next lesson: {nextLessonTitle ?? "Continue"} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
