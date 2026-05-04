"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markLessonComplete } from "@/lib/progress";
import { Button } from "@/components/ui/button";

export function LessonStickyFooter({
  lessonId,
  levelCode,
  alreadyCompleted,
}: {
  lessonId: string;
  levelCode: string;
  alreadyCompleted: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(alreadyCompleted);
  const [pending, startTransition] = useTransition();

  function complete() {
    setError(null);
    startTransition(async () => {
      try {
        await markLessonComplete(lessonId, levelCode);
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save progress.");
      }
    });
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 p-4 md:pointer-events-auto md:static md:z-0 md:p-0">
      <div className="pointer-events-auto mx-auto max-w-3xl rounded-2xl border border-black/[0.08] bg-white/95 p-4 shadow-lg shadow-black/10 backdrop-blur md:border-0 md:bg-transparent md:p-0 md:shadow-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/levels/${levelCode}`}
            className="text-center text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] sm:text-left"
          >
            ← Back to level {levelCode}
          </Link>
          {done ? (
            <p className="text-center text-sm font-medium text-[var(--color-accent)] sm:text-right">
              Lesson marked complete. Nice work.
            </p>
          ) : (
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {error ? (
                <p className="text-center text-sm text-red-600 sm:text-right" role="alert">
                  {error}
                </p>
              ) : null}
              <Button
                type="button"
                variant="primary"
                className="w-full sm:w-auto"
                disabled={pending}
                onClick={complete}
              >
                {pending ? "Saving…" : "Mark lesson complete"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
