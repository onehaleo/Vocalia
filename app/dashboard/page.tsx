import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getLevelCardsForUser, getProgressSummary } from "@/lib/dashboard";
import { DashboardLevelCard } from "@/components/curriculum/dashboard-level-card";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const checkoutOk = params.checkout === "success";

  const paid = !!profile?.has_paid_access;
  const [levels, summary] = await Promise.all([
    getLevelCardsForUser(user.id, paid),
    getProgressSummary(user.id, paid),
  ]);

  const overall =
    summary.totalLessons > 0 ? summary.completedLessons / summary.totalLessons : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {checkoutOk ? (
        <div className="mb-8 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Payment received — your curriculum should unlock within a few seconds. Refresh if lessons
          still appear locked (Stripe webhooks can take a moment in development).
        </div>
      ) : null}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <p className="mt-2 text-[var(--color-ink-muted)]">
            {paid
              ? "Pick a level and keep stacking short wins."
              : "Preview your path from A1 to B2 — unlock drills when you are ready."}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Access
          </p>
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {paid ? "Active" : "Locked"}
          </p>
          {!paid ? (
            <LinkButton href="/pricing" variant="primary" className="mt-2">
              Get access
            </LinkButton>
          ) : null}
        </div>
      </div>

      <Card className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Progress summary</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          {paid
            ? `${summary.completedLessons} of ${summary.totalLessons} lessons completed · ${summary.masteredPhrases} phrases marked mastered`
            : "Complete checkout to log lesson and phrase progress across the curriculum."}
        </p>
        <div className="mt-4">
          <ProgressBar value={paid ? overall : 0} />
        </div>
      </Card>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Your levels</h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
          European Portuguese track — additional languages can reuse this layout later.
        </p>

        {levels.length === 0 ? (
          <Card className="mt-6 text-sm text-[var(--color-ink-muted)]">
            No levels found. Run <code className="rounded bg-black/[0.06] px-1">db/seed.sql</code> in Supabase.
          </Card>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {levels.map((level) => (
              <DashboardLevelCard key={level.id} level={level} locked={!paid} />
            ))}
          </div>
        )}
      </section>

      {!paid ? (
        <Card className="mt-10 border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]/40">
          <h3 className="text-lg font-semibold text-[var(--color-ink)]">Unlock the practice layer</h3>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            After payment you will see every lesson, phrase card, phonetic breakdown, and progress save.
            The preview above shows real level titles and lesson counts from the seed.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <LinkButton href="/pricing" variant="primary">
              Join beta checkout
            </LinkButton>
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Log in on another device
            </Link>
          </div>
        </Card>
      ) : null}
    </main>
  );
}
