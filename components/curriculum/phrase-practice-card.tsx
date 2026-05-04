"use client";

import { useState, useTransition } from "react";
import type { Database } from "@/types/database";
import { markPhraseMastered, markPhrasePracticing } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Phrase = Database["public"]["Tables"]["phrases"]["Row"];
type PhraseProg = Pick<
  Database["public"]["Tables"]["user_phrase_progress"]["Row"],
  "status" | "practice_count"
> | null;

export function PhrasePracticeCard({
  phrase,
  progress,
  lessonId,
  levelCode,
}: {
  phrase: Phrase;
  progress: PhraseProg;
  lessonId: string;
  levelCode: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const paths = { lessonId, levelCode };

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            {phrase.phrase}
          </p>
          <p className="text-sm text-[var(--color-ink-muted)]">{phrase.translation}</p>
        </div>
        {progress?.status ? (
          <span className="rounded-full bg-[var(--color-accent-muted)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
            {progress.status}
            {progress.practice_count ? ` · ${progress.practice_count}×` : null}
          </span>
        ) : (
          <span className="rounded-full bg-black/[0.04] px-2.5 py-0.5 text-xs text-[var(--color-ink-muted)]">
            new
          </span>
        )}
      </div>

      <div className="rounded-xl bg-black/[0.02] p-3 text-sm">
        <p>
          <span className="font-medium text-[var(--color-ink)]">Sounds like: </span>
          <span className="text-[var(--color-ink-muted)]">{phrase.phonetic}</span>
        </p>
        {phrase.syllable_breakdown ? (
          <p className="mt-1 text-[var(--color-ink-muted)]">
            <span className="font-medium text-[var(--color-ink)]">Syllables: </span>
            {phrase.syllable_breakdown}
          </p>
        ) : null}
      </div>

      {phrase.pronunciation_notes ? (
        <p className="text-sm text-[var(--color-ink)]">
          <span className="font-medium">Notes: </span>
          {phrase.pronunciation_notes}
        </p>
      ) : null}
      {phrase.common_mistakes ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          <span className="font-medium text-[var(--color-ink)]">Common mistake: </span>
          {phrase.common_mistakes}
        </p>
      ) : null}

      {phrase.audio_url ? (
        <audio controls className="w-full" preload="none">
          <source src={phrase.audio_url} />
        </audio>
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="secondary"
          disabled={pending}
          onClick={() => run(() => markPhrasePracticing(phrase.id, paths))}
        >
          Mark practicing
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={pending}
          onClick={() => run(() => markPhraseMastered(phrase.id, paths))}
        >
          Mark mastered
        </Button>
      </div>
    </Card>
  );
}
