import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getProgressDashboard } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";
import { SKILL_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");

  const paid = !!profile?.has_paid_access;
  const dash = await getProgressDashboard(user.id, paid);

  if (!dash) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Card className="text-sm text-[var(--color-ink-muted)]">Could not load progress.</Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Progress</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Dashboard</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Course completion is lesson-based. Skills reflect correct activity attempts logged from lessons and practice.
      </p>

      {!paid ? (
        <Card className="mt-8 text-sm text-[var(--color-ink-muted)]">
          Unlock Vocalia to record lesson completion, phrase statuses, and activity attempts.{" "}
          <Link href="/pricing" className="font-medium text-[var(--color-accent)] hover:underline">
            Pricing
          </Link>
        </Card>
      ) : (
        <div className="mt-10 space-y-8">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Overall course</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              {dash.completedLessons} of {dash.totalLessons} lessons completed
            </p>
            <div className="mt-4">
              <ProgressBar value={dash.overallLessonRatio} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">By level</h2>
            <ul className="mt-4 space-y-3">
              {dash.byLevel.map((lv) => (
                <li key={lv.code}>
                  <div className="mb-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
                    <span>
                      {lv.code} · {lv.title}
                    </span>
                    <span>
                      {lv.done}/{lv.total}
                    </span>
                  </div>
                  <ProgressBar value={lv.total > 0 ? lv.done / lv.total : 0} />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Skills (activities answered correctly)</h2>
            <ul className="mt-4 space-y-3">
              {dash.skills.length === 0 ? (
                <li className="text-sm text-[var(--color-ink-muted)]">Complete a lesson activity to see skill bars.</li>
              ) : (
                dash.skills.map((s) => (
                  <li key={s.skill}>
                    <div className="mb-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
                      <span>{SKILL_LABELS[s.skill] ?? s.skill}</span>
                      <span>
                        {s.completed}/{s.available}
                      </span>
                    </div>
                    <ProgressBar value={s.available > 0 ? s.completed / s.available : 0} />
                  </li>
                ))
              )}
            </ul>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h3 className="text-base font-semibold text-[var(--color-ink)]">Mastered phrases</h3>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">{dash.masteredPhrases}</p>
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-[var(--color-ink)]">Needs practice</h3>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">{dash.needsPracticePhrases}</p>
            </Card>
            <Card className="sm:col-span-2">
              <h3 className="text-base font-semibold text-[var(--color-ink)]">Saved phrases</h3>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">{dash.savedPhrases}</p>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
