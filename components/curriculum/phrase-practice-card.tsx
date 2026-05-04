"use client";

import { useState, useTransition } from "react";
import type { Database } from "@/types/database";
import type { LessonRevalidatePaths } from "@/lib/progress";
import {
  markPhraseMastered,
  markPhraseNeedsPractice,
  markPhrasePracticing,
  setPhraseSpeakingConfidence,
  togglePhraseSaved,
} from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AudioPlaceholderBar } from "@/components/learning/audio-placeholders";

type Phrase = Database["public"]["Tables"]["phrases"]["Row"];
type PhraseProg = Pick<
  Database["public"]["Tables"]["user_phrase_progress"]["Row"],
  "status" | "practice_count" | "is_saved" | "speaking_confidence"
> | null;

export function PhrasePracticeCard({
  phrase,
  progress,
  paths,
  showAudioRow = true,
}: {
  phrase: Phrase;
  progress: PhraseProg;
  paths: LessonRevalidatePaths;
  showAudioRow?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{phrase.phrase}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">{phrase.translation}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {progress?.is_saved ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
              Saved
            </span>
          ) : null}
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

      {phrase.tags && phrase.tags.length > 0 ? (
        <p className="text-xs text-[var(--color-ink-muted)]">
          <span className="font-medium text-[var(--color-ink)]">Tags: </span>
          {phrase.tags.join(", ")}
        </p>
      ) : null}

      {phrase.audio_url ? (
        <audio controls className="w-full" preload="none">
          <source src={phrase.audio_url} />
        </audio>
      ) : showAudioRow ? (
        <AudioPlaceholderBar label="Phrase audio" />
      ) : null}

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2 border-t border-black/[0.06] pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
          Review confidence
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => markPhraseNeedsPractice(phrase.id, paths))}
          >
            Needs practice
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => markPhrasePracticing(phrase.id, paths))}
          >
            Practicing
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={pending}
            onClick={() => run(() => markPhraseMastered(phrase.id, paths))}
          >
            Mastered
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => togglePhraseSaved(phrase.id, paths))}
          >
            {progress?.is_saved ? "Unsave" : "Save phrase"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
          Speaking self-check (1–5)
        </p>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              type="button"
              variant={progress?.speaking_confidence === n ? "primary" : "secondary"}
              disabled={pending}
              onClick={() => run(() => setPhraseSpeakingConfidence(phrase.id, n, paths))}
            >
              {n}
            </Button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-ink-muted)]">Optional — stored for your review queue only.</p>
      </div>
    </Card>
  );
}
