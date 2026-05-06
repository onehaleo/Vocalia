"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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

type Phrase = Database["public"]["Tables"]["phrases"]["Row"];
type PhraseProg = Pick<
  Database["public"]["Tables"]["user_phrase_progress"]["Row"],
  "status" | "practice_count" | "is_saved" | "speaking_confidence"
> | null;

function phraseHasAudio(p: Phrase) {
  return !!(p.audio_url || p.audio_slow_url || p.audio_natural_url || p.audio_context_url);
}

export function PhrasePracticeCard({
  phrase,
  progress,
  paths,
}: {
  phrase: Phrase;
  progress: PhraseProg;
  paths: LessonRevalidatePaths;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">{phrase.phrase}</p>
          <p className="text-sm text-[var(--color-ink-muted)]">{phrase.translation}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
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

      <div className="rounded-xl border border-black/[0.06] bg-white p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">Audio</p>
        {phraseHasAudio(phrase) ? (
          <div className="mt-2 space-y-2">
            {phrase.audio_slow_url ? (
              <div>
                <p className="mb-1 text-[11px] text-[var(--color-ink-muted)]">Slow</p>
                <audio controls className="w-full" preload="none">
                  <source src={phrase.audio_slow_url} />
                </audio>
              </div>
            ) : null}
            {phrase.audio_natural_url ? (
              <div>
                <p className="mb-1 text-[11px] text-[var(--color-ink-muted)]">Natural</p>
                <audio controls className="w-full" preload="none">
                  <source src={phrase.audio_natural_url} />
                </audio>
              </div>
            ) : null}
            {phrase.audio_context_url ? (
              <div>
                <p className="mb-1 text-[11px] text-[var(--color-ink-muted)]">In context</p>
                <audio controls className="w-full" preload="none">
                  <source src={phrase.audio_context_url} />
                </audio>
              </div>
            ) : null}
            {phrase.audio_url ? (
              <div>
                <p className="mb-1 text-[11px] text-[var(--color-ink-muted)]">Phrase</p>
                <audio controls className="w-full" preload="none">
                  <source src={phrase.audio_url} />
                </audio>
              </div>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Audio coming soon</p>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="space-y-2 border-t border-black/[0.06] pt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">Progress</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
        </div>
      </div>

      <div className="border-t border-black/[0.06] pt-3">
        <Button
          type="button"
          variant="ghost"
          className="h-auto w-full justify-start px-0 py-0 text-sm text-[var(--color-accent)]"
          onClick={() => setDetailsOpen((v) => !v)}
        >
          {detailsOpen ? "Hide pronunciation details" : "Show pronunciation details"}
        </Button>
        {detailsOpen ? (
          <div className="mt-4 space-y-4">
            {phrase.pronunciation_notes ? (
              <p className="text-sm text-[var(--color-ink)]">
                <span className="font-medium">Pronunciation notes: </span>
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

            <div className="space-y-2 border-t border-black/[0.06] pt-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={pending}
                onClick={() => run(() => togglePhraseSaved(phrase.id, paths))}
              >
                {progress?.is_saved ? "Unsave phrase" : "Save phrase"}
              </Button>
              {progress?.is_saved ? (
                <p className="text-xs text-[var(--color-ink-muted)]">Saved phrases appear in your Review queue.</p>
              ) : null}
            </div>

            <div className="space-y-2 border-t border-black/[0.06] pt-3">
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                Speaking confidence (1–5)
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
              <p className="text-xs text-[var(--color-ink-muted)]">Optional — for your own tracking only.</p>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
