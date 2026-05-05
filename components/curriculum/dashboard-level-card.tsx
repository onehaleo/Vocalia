import type { LevelCardModel } from "@/lib/dashboard";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";
import { LockIcon } from "@/components/icons/lock-icon";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { cn } from "@/lib/cn";
import { marketingUrl } from "@/lib/site";

export function DashboardLevelCard({
  level,
  locked,
}: {
  level: LevelCardModel;
  locked: boolean;
}) {
  const ratio =
    level.lessonCount > 0 ? level.completedLessons / level.lessonCount : 0;

  return (
    <Card
      className={cn(
        "flex flex-col gap-4",
        locked && "border-dashed border-black/15 bg-black/[0.02]",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
            {level.code}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{level.title}</h2>
          {level.description ? (
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{level.description}</p>
          ) : null}
        </div>
        {locked ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-2 py-1 text-xs text-[var(--color-ink-muted)]">
            <LockIcon className="opacity-70" />
            Locked
          </span>
        ) : null}
      </div>

      <div>
        <div className="mb-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
          <span>
            {level.lessonCount} lesson{level.lessonCount === 1 ? "" : "s"}
          </span>
          <span>
            {locked ? "—" : `${level.completedLessons} completed`}
          </span>
        </div>
        <ProgressBar value={locked ? 0 : ratio} />
      </div>

      {locked ? (
        <p className="text-sm text-[var(--color-ink-muted)]">
          Unlock full phrase drills, phonetic breakdowns, and lesson flow for every level.
        </p>
      ) : null}

      <div className="mt-auto">
        {locked ? (
          <div className="space-y-3">
            <CheckoutButton label="Get access" className="w-full sm:w-auto" />
            <LinkButton href={marketingUrl("/#pricing")} variant="secondary" className="w-full sm:w-auto">
              View pricing details
            </LinkButton>
          </div>
        ) : (
          <LinkButton href={`/learn/${level.code}`} variant="primary" className="w-full sm:w-auto">
            Open level
          </LinkButton>
        )}
      </div>
    </Card>
  );
}
