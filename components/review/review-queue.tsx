"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ReviewItem } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { SKILL_LABELS } from "@/lib/constants";

const statuses = [
  { id: "all", label: "All statuses" },
  { id: "needs_practice", label: "Needs practice" },
  { id: "practicing", label: "Practicing" },
  { id: "mastered", label: "Mastered" },
  { id: "new", label: "New / other" },
] as const;

export function ReviewQueue({ items }: { items: ReviewItem[] }) {
  const levels = useMemo(() => [...new Set(items.map((i) => i.levelCode))].sort(), [items]);
  const skills = useMemo(() => [...new Set(items.map((i) => i.skillHint))].sort(), [items]);
  const lessons = useMemo(() => {
    const map = new Map<string, string>();
    for (const i of items) {
      map.set(`${i.levelCode}/${i.moduleSlug}/${i.lessonSlug}`, i.lessonTitle);
    }
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [items]);

  const [level, setLevel] = useState<string>("all");
  const [skill, setSkill] = useState<string>("all");
  const [lesson, setLesson] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (level !== "all" && i.levelCode !== level) return false;
      if (skill !== "all" && i.skillHint !== skill) return false;
      if (lesson !== "all" && `${i.levelCode}/${i.moduleSlug}/${i.lessonSlug}` !== lesson) return false;
      if (status !== "all" && i.progress.status !== status) return false;
      return true;
    });
  }, [items, level, skill, lesson, status]);

  const difficult = filtered.filter((i) => i.progress.status === "needs_practice");
  const savedOnly = filtered.filter((i) => i.progress.is_saved);

  return (
    <div className="space-y-8">
      <Card className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Filters</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-ink-muted)]">Level</span>
            <select
              className="rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-[var(--color-ink)]"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="all">All levels</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-[var(--color-ink-muted)]">Skill</span>
            <select
              className="rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-[var(--color-ink)]"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            >
              <option value="all">All skills</option>
              {skills.map((s) => (
                <option key={s} value={s}>
                  {SKILL_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-[var(--color-ink-muted)]">Lesson</span>
            <select
              className="rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-[var(--color-ink)]"
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
            >
              <option value="all">All lessons</option>
              {lessons.map(([key, title]) => (
                <option key={key} value={key}>
                  {title}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="text-[var(--color-ink-muted)]">Status</span>
            <select
              className="rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-[var(--color-ink)]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Queue ({filtered.length})</h2>
        {filtered.length === 0 ? (
          <Card className="text-sm text-[var(--color-ink-muted)]">
            Nothing matches these filters yet. Practice a few phrases in a lesson to populate your queue.
          </Card>
        ) : (
          <ul className="space-y-3">
            {filtered.map((i) => (
              <li key={i.phrase.id}>
                <Card className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-ink)]">{i.phrase.phrase}</p>
                    <p className="text-sm text-[var(--color-ink-muted)]">{i.phrase.translation}</p>
                    <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
                      {i.levelCode} · {i.lessonTitle} · {SKILL_LABELS[i.skillHint] ?? i.skillHint}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-black/[0.06] px-2 py-0.5">{i.progress.status}</span>
                      {i.progress.is_saved ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">Saved</span>
                      ) : null}
                      {i.progress.speaking_confidence ? (
                        <span className="rounded-full bg-black/[0.06] px-2 py-0.5">
                          Speaking {i.progress.speaking_confidence}/5
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <Link
                    href={`/learn/${i.levelCode}/${i.moduleSlug}/${i.lessonSlug}`}
                    className="shrink-0 text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    Open lesson
                  </Link>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-ink)]">Difficult sounds</h3>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Phrases marked needs practice in the current filter.</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{difficult.length}</p>
        </Card>
        <Card>
          <h3 className="text-base font-semibold text-[var(--color-ink)]">Saved phrases</h3>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">Bookmarked lines in the filtered set.</p>
          <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{savedOnly.length}</p>
        </Card>
      </section>
    </div>
  );
}
