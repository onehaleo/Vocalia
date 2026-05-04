import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getLearnPathForUser } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ProgressBar } from "@/components/progress/progress-bar";

export const dynamic = "force-dynamic";

export default async function LearnPage() {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");

  const paid = !!profile?.has_paid_access;
  const data = await getLearnPathForUser(user.id, paid);

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Card className="text-sm text-[var(--color-ink-muted)]">
          No course found. Run <code className="rounded bg-black/[0.06] px-1">db/seed.sql</code> in Supabase.
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Learn</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{data.course.title}</h1>
          <p className="mt-2 max-w-2xl text-[var(--color-ink-muted)]">
            {data.course.description}
          </p>
        </div>
        {!paid ? (
          <LinkButton href="/pricing" variant="primary" className="shrink-0 self-start">
            Unlock lessons
          </LinkButton>
        ) : null}
      </div>

      <section className="mt-12 space-y-10">
        {data.levels.map((block) => {
          const totalModLessons = block.modules.reduce((acc, m) => acc + m.lessons.length, 0);
          const doneModLessons = block.modules.reduce((acc, m) => acc + m.completedLessonIds.size, 0);
          const ratio = totalModLessons > 0 ? doneModLessons / totalModLessons : 0;

          return (
            <Card key={block.level.id} className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                    {block.level.code} · {block.level.path_label ?? block.level.title}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{block.level.title}</h2>
                  {block.level.description ? (
                    <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{block.level.description}</p>
                  ) : null}
                </div>
                <Link
                  href={`/learn/${block.level.code}`}
                  className="shrink-0 text-sm font-medium text-[var(--color-accent)] hover:underline"
                >
                  Open path →
                </Link>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
                  <span>
                    {block.modules.length} module{block.modules.length === 1 ? "" : "s"} · {totalModLessons} lesson
                    {totalModLessons === 1 ? "" : "s"}
                  </span>
                  <span>{paid ? `${doneModLessons} completed` : "Preview"}</span>
                </div>
                <ProgressBar value={paid ? ratio : 0} />
              </div>

              <ul className="space-y-2 border-t border-black/[0.06] pt-4">
                {block.modules.map((m) => (
                  <li
                    key={m.module.id}
                    className="flex flex-col gap-1 rounded-xl bg-black/[0.02] px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">{m.module.title}</p>
                      <p className="text-xs text-[var(--color-ink-muted)]">
                        {m.module.coming_soon ? "Coming soon" : `${m.lessons.length} lesson(s)`}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </section>

      <Card className="mt-10 border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)]/30">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Pronunciation lab</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          Short European Portuguese sound lessons with listen-and-repeat placeholders.
        </p>
        <div className="mt-4">
          <LinkButton href="/practice/pronunciation" variant="secondary">
            Open pronunciation lab
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
