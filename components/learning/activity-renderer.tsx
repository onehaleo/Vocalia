"use client";

import type { ReactNode } from "react";
import { useCallback, useMemo, useState, useTransition } from "react";
import type { ActivityRow } from "@/types/curriculum";
import type { Json } from "@/types/database";
import { recordActivityAttempt } from "@/lib/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AudioPlaceholderBar } from "@/components/learning/audio-placeholders";

function norm(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,!?;:]$/g, "");
}

export function ActivityRenderer({ activity }: { activity: ActivityRow }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const cfg = activity.config as Record<string, Json>;

  const submit = useCallback(
    (correct: boolean, response: Json | null) => {
      setMsg(null);
      startTransition(async () => {
        try {
          await recordActivityAttempt(activity.id, correct, response);
          setDone(true);
          setMsg(correct ? "Recorded." : "Saved — try again when you are ready.");
        } catch (e) {
          setMsg(e instanceof Error ? e.message : "Could not save.");
        }
      });
    },
    [activity.id],
  );

  let body: ReactNode;
  switch (activity.activity_type) {
    case "multiple_choice":
      body = <MultipleChoice cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    case "listen_placeholder":
      body = (
        <div className="space-y-3">
          <AudioPlaceholderBar label={typeof cfg.label === "string" ? cfg.label : undefined} />
          <p className="text-xs text-[var(--color-ink-muted)]">
            Audio files are not wired yet — buttons stay disabled until you add URLs in the catalog.
          </p>
        </div>
      );
      break;
    case "match_meaning":
      body = <MatchMeaning cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    case "type_missing":
      body = <TypeMissing cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    case "translate_pt":
      body = <TranslatePt cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    case "rebuild_sentence":
      body = <RebuildSentence cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    case "self_rate_speaking":
      body = <SelfRateSpeaking cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    case "pronunciation_confidence":
      body = <PronunciationConfidence cfg={cfg} disabled={pending || done} onResult={submit} />;
      break;
    default:
      body = (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Unsupported activity type: {activity.activity_type}
        </p>
      );
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--color-ink)]">{activity.title}</h3>
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
          {activity.skill}
        </span>
      </div>
      {body}
      {msg ? (
        <p className={`text-sm ${done ? "text-[var(--color-accent)]" : "text-red-600"}`} role="status">
          {msg}
        </p>
      ) : null}
    </Card>
  );
}

function MultipleChoice({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const prompt = typeof cfg.prompt === "string" ? cfg.prompt : "";
  const options = Array.isArray(cfg.options) ? (cfg.options as string[]) : [];
  const correctIndex = typeof cfg.correctIndex === "number" ? cfg.correctIndex : 0;
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {prompt ? <p className="text-sm text-[var(--color-ink)]">{prompt}</p> : null}
      <div className="flex flex-col gap-2">
        {options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => {
              setPicked(i);
              onResult(i === correctIndex, { pickedIndex: i });
            }}
            className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
              picked === i
                ? i === correctIndex
                  ? "border-emerald-300 bg-emerald-50"
                  : "border-amber-300 bg-amber-50"
                : "border-black/[0.08] hover:border-black/20"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function MatchMeaning({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const pairs = useMemo(
    () => (Array.isArray(cfg.pairs) ? (cfg.pairs as [string, string][]) : []),
    [cfg.pairs],
  );
  const [selectedPt, setSelectedPt] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});

  const shuffledEn = useMemo(() => {
    const ens = pairs.map((p) => p[1]);
    return [...ens].sort(() => Math.random() - 0.5);
  }, [pairs]);

  function pickEn(en: string) {
    if (!selectedPt || disabled) return;
    setMatches((m) => ({ ...m, [selectedPt]: en }));
    setSelectedPt(null);
  }

  function check() {
    let ok = true;
    for (const [pt, en] of pairs) {
      if (norm(matches[pt] ?? "") !== norm(en)) ok = false;
    }
    onResult(ok, { matches });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-ink-muted)]">Tap a Portuguese line, then its English meaning.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-[var(--color-ink-muted)]">Portuguese</p>
          {pairs.map(([pt]) => (
            <button
              key={pt}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedPt(pt)}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                selectedPt === pt ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]/40" : "border-black/[0.08]"
              }`}
            >
              {pt}
              {matches[pt] ? (
                <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">→ {matches[pt]}</span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-[var(--color-ink-muted)]">English</p>
          {shuffledEn.map((en) => (
            <button
              key={en}
              type="button"
              disabled={disabled}
              onClick={() => pickEn(en)}
              className="w-full rounded-xl border border-black/[0.08] px-3 py-2 text-left text-sm hover:border-black/20"
            >
              {en}
            </button>
          ))}
        </div>
      </div>
      <Button type="button" variant="primary" disabled={disabled} onClick={check}>
        Check matches
      </Button>
    </div>
  );
}

function TypeMissing({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const template = typeof cfg.template === "string" ? cfg.template : "";
  const answer = typeof cfg.answer === "string" ? cfg.answer : "";
  const hint = typeof cfg.hint === "string" ? cfg.hint : "";
  const [val, setVal] = useState("");

  return (
    <div className="space-y-3">
      <p className="font-mono text-sm text-[var(--color-ink)]">{template}</p>
      {hint ? <p className="text-xs text-[var(--color-ink-muted)]">{hint}</p> : null}
      <input
        className="w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-sm"
        disabled={disabled}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Missing word"
      />
      <Button
        type="button"
        variant="primary"
        disabled={disabled}
        onClick={() => onResult(norm(val) === norm(answer), { typed: val })}
      >
        Check
      </Button>
    </div>
  );
}

function TranslatePt({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const prompt = typeof cfg.prompt === "string" ? cfg.prompt : "";
  const answers = Array.isArray(cfg.answers) ? (cfg.answers as string[]) : [];
  const [val, setVal] = useState("");

  return (
    <div className="space-y-3">
      {prompt ? <p className="text-sm text-[var(--color-ink)]">{prompt}</p> : null}
      <textarea
        className="min-h-[88px] w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-sm"
        disabled={disabled}
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
      <Button
        type="button"
        variant="primary"
        disabled={disabled}
        onClick={() => {
          const n = norm(val);
          const ok = answers.some((a) => norm(a) === n);
          onResult(ok, { typed: val });
        }}
      >
        Check translation
      </Button>
    </div>
  );
}

function RebuildSentence({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const answer = typeof cfg.answer === "string" ? cfg.answer : "";
  const [picked, setPicked] = useState<string[]>([]);
  const pool = useMemo(() => {
    const tokens = Array.isArray(cfg.tokens) ? (cfg.tokens as string[]) : [];
    return [...tokens].sort(() => Math.random() - 0.5);
  }, [cfg.tokens]);

  function add(t: string) {
    setPicked((p) => [...p, t]);
  }
  function removeLast() {
    setPicked((p) => p.slice(0, -1));
  }

  const built = picked.join(" ");
  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--color-ink-muted)]">Tap words in order. Aim for natural spacing and punctuation.</p>
      <div className="min-h-[44px] rounded-xl border border-dashed border-black/20 bg-black/[0.02] px-3 py-2 text-sm">
        {built || <span className="text-[var(--color-ink-muted)]">Your sentence</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {pool.map((t, i) => (
          <button
            key={`${t}-${i}`}
            type="button"
            disabled={disabled}
            onClick={() => add(t)}
            className="rounded-lg border border-black/[0.1] bg-white px-2 py-1 text-sm"
          >
            {t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled={disabled || picked.length === 0} onClick={removeLast}>
          Undo last
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={disabled}
          onClick={() => onResult(norm(built) === norm(answer), { built })}
        >
          Check sentence
        </Button>
      </div>
    </div>
  );
}

function SelfRateSpeaking({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const cue = typeof cfg.cue === "string" ? cfg.cue : "How comfortable did that feel?";
  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--color-ink)]">{cue}</p>
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button key={n} type="button" variant="secondary" disabled={disabled} onClick={() => onResult(true, { rating: n })}>
            {n}
          </Button>
        ))}
      </div>
      <p className="text-xs text-[var(--color-ink-muted)]">Self-rating only — no automatic scoring yet.</p>
    </div>
  );
}

function PronunciationConfidence({
  cfg,
  disabled,
  onResult,
}: {
  cfg: Record<string, Json>;
  disabled: boolean;
  onResult: (ok: boolean, response: Json | null) => void;
}) {
  const target = typeof cfg.targetSound === "string" ? cfg.targetSound : "this sound";
  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--color-ink)]">After listening and repeating, how clear did {target} feel?</p>
      <div className="flex flex-wrap gap-2">
        {["Shaky", "Okay", "Solid"].map((label, i) => (
          <Button key={label} type="button" variant="secondary" disabled={disabled} onClick={() => onResult(i >= 1, { tier: label })}>
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
