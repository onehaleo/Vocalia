import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getReviewItems } from "@/lib/learning";
import { ReviewQueue } from "@/components/review/review-queue";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");

  const paid = !!profile?.has_paid_access;
  const items = paid ? await getReviewItems(user.id, true) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Review</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Your queue</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Filter by level, skill, lesson, and status. “Difficult sounds” maps to anything you marked as needs practice.
      </p>

      {!paid ? (
        <Card className="mt-8 text-sm text-[var(--color-ink-muted)]">
          Unlock Vocalia to track phrase statuses and build a personal review queue.
        </Card>
      ) : (
        <div className="mt-10">
          <ReviewQueue items={items} />
        </div>
      )}
    </main>
  );
}
