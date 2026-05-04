import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getLearnPathForUser } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress/progress-bar";

export const dynamic = "force-dynamic";

export default async function LearnLevelPage({
  params,
}: {
  params: Promise<{ levelCode: string }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");

  const { levelCode: raw } = await params;
  const levelCode = raw.toUpperCase();

  const paid = !!profile?.has_paid_access;
  const data = await getLearnPathForUser(user.id, paid);
  if (!data) notFound();

  const block = data.levels.find((b) => b.level.code === levelCode);
  if (!block) notFound();

  const total = block.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const done = block.modules.reduce((acc, m) => acc + m.completedLessonIds.size, 0);
  const ratio = total > 0 ? done / total : 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/learn" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
            ← Learn home
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            {block.level.code} · {block.level.path_label}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{block.level.title}</h1>
          {block.level.description ? (
            <p className="mt-3 text-[var(--color-ink-muted)]">{block.level.description}</p>
          ) : null}
        </div>
        <LinkButton href="/learn" variant="secondary" className="shrink-0 self-start">
          All levels
        </LinkButton>
      </div>

      <Card className="mt-8">
        <div className="mb-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
          <span>Level progress</span>
          <span>{paid ? `${done} / ${total} lessons` : "Unlock to save progress"}</span>
        </div>
        <ProgressBar value={paid ? ratio : 0} />
      </Card>

      <section className="mt-10 space-y-8">
        {block.modules.map((m) => (
          <div key={m.module.id}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">{m.module.title}</h2>
              {m.module.coming_soon ? (
                <span className="text-xs font-medium uppercase text-[var(--color-ink-muted)]">Coming soon</span>
              ) : null}
            </div>
            {m.module.description ? (
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{m.module.description}</p>
            ) : null}

            {m.module.coming_soon || m.lessons.length === 0 ? (
              <Card className="mt-4 border-dashed border-black/15 bg-black/[0.02] text-sm text-[var(--color-ink-muted)]">
                {m.module.coming_soon
                  ? "Lessons for this module are on the roadmap."
                  : "No published lessons in this module yet."}
              </Card>
            ) : (
              <ul className="mt-4 space-y-3">
                {m.lessons.map((les) => {
                  const st = m.completedLessonIds.has(les.id)
                    ? "completed"
                    : m.hasPracticeLessonIds.has(les.id)
                      ? "in_progress"
                      : "not_started";
                  const label =
                    st === "completed" ? "Completed" : st === "in_progress" ? "In progress" : "Not started";
                  const href = `/learn/${block.level.code}/${m.module.slug}/${les.slug}`;
                  return (
                    <li key={les.id}>
                      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                            {label}
                          </p>
                          <h3 className="text-base font-semibold text-[var(--color-ink)]">{les.title}</h3>
                          {les.description ? (
                            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{les.description}</p>
                          ) : null}
                        </div>
                        <LinkButton
                          href={paid ? href : "/pricing?from=paid-content"}
                          variant={st === "completed" ? "secondary" : "primary"}
                          className="shrink-0 self-start sm:self-center"
                        >
                          {paid ? (st === "not_started" ? "Start" : "Open") : "Preview locked"}
                        </LinkButton>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
