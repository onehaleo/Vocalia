import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile, type ProfileRow } from "@/lib/auth";
import { getLevelCardsForUser, getProgressSummary } from "@/lib/dashboard";
import {
  trySyncPaidAccessFromCheckoutEmail,
  trySyncPaidAccessFromCheckoutSession,
} from "@/lib/stripe-sync-access";
import { DashboardLevelCard } from "@/components/curriculum/dashboard-level-card";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/progress/progress-bar";
import { firstSearchParam } from "@/lib/search-params";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { marketingUrl } from "@/lib/site";

/** Avoid static shell / param edge cases; always run checkout sync with real searchParams. */
export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkout?: string | string[];
    payment?: string | string[];
    session_id?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const payment = firstSearchParam(params.payment);
  const checkoutLegacy = firstSearchParam(params.checkout);
  const checkoutOk =
    payment === "success" || checkoutLegacy === "success";
  const sessionId = firstSearchParam(params.session_id);

  const { user, profile } = await getProfile();
  if (!user) {
    redirect("/login");
  }

  let profileForUi = profile;
  let accessSyncMessage: string | null = null;

  if (checkoutOk && !profile?.has_paid_access) {
    const parts: string[] = [];

    const refreshProfile = async () => {
      const { profile: p } = await getProfile();
      if (p) profileForUi = p;
    };

    /** DB updated but a second read in the same request can still show old flags — keep UI consistent. */
    const markPaidLocally = () => {
      const base = profileForUi ?? profile;
      if (base) {
        profileForUi = { ...base, has_paid_access: true };
      } else {
        profileForUi = {
          id: user.id,
          email: user.email ?? null,
          full_name: null,
          has_paid_access: true,
          stripe_customer_id: null,
          created_at: new Date().toISOString(),
        } satisfies ProfileRow;
      }
    };

    if (sessionId) {
      const r1 = await trySyncPaidAccessFromCheckoutSession(user.id, sessionId);
      if (r1.ok) {
        await refreshProfile();
        if (!profileForUi?.has_paid_access) markPaidLocally();
      } else {
        parts.push(`Session link: ${r1.reason}`);
      }
    }

    if (!profileForUi?.has_paid_access) {
      const r2 = await trySyncPaidAccessFromCheckoutEmail(
        user.id,
        profileForUi?.email ?? user.email ?? undefined,
      );
      if (r2.ok) {
        await refreshProfile();
        if (!profileForUi?.has_paid_access) markPaidLocally();
        parts.length = 0;
      } else {
        parts.push(`Stripe sessions for your email: ${r2.reason}`);
      }
    }

    accessSyncMessage = parts.length > 0 ? parts.join("\n\n") : null;

    if (!profileForUi?.has_paid_access && !accessSyncMessage) {
      accessSyncMessage =
        "Unlock did not apply and no Stripe error was recorded. Hard-refresh this page. If it persists, confirm NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are from the same Supabase project where this account was created.";
    }
  }

  const paid = !!profileForUi?.has_paid_access;
  const [levels, summary] = await Promise.all([
    getLevelCardsForUser(user.id, paid),
    getProgressSummary(user.id, paid),
  ]);

  const overall =
    summary.totalLessons > 0 ? summary.completedLessons / summary.totalLessons : 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      {checkoutOk && paid ? (
        <div className="mb-8 rounded-2xl border border-emerald-200/80 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
          Payment confirmed — your curriculum is unlocked.
        </div>
      ) : null}

      {checkoutOk && !paid && accessSyncMessage ? (
        <div className="mb-8 rounded-2xl border border-amber-200/90 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Access could not be unlocked automatically</p>
          <p className="mt-2 whitespace-pre-wrap">{accessSyncMessage}</p>
          <p className="mt-2 text-xs text-amber-900/90">
            For local Stripe: run <code className="rounded bg-white/80 px-1">npm run stripe:listen</code>, set{" "}
            <code className="rounded bg-white/80 px-1">STRIPE_WEBHOOK_SECRET</code> to the{" "}
            <code className="rounded bg-white/80 px-1">whsec_…</code> value, add{" "}
            <code className="rounded bg-white/80 px-1">SUPABASE_SERVICE_ROLE_KEY</code>, then restart{" "}
            <code className="rounded bg-white/80 px-1">npm run dev</code> and pay again — or flip{" "}
            <code className="rounded bg-white/80 px-1">has_paid_access</code> manually in Supabase for your user
            row for testing.
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
            Welcome back{profileForUi?.full_name ? `, ${profileForUi.full_name}` : ""}
          </h1>
          <p className="mt-2 text-[var(--color-ink-muted)]">
            {paid
              ? "Pick a level and keep stacking short wins."
              : "Preview your path from A1 to B2 — unlock drills when you are ready."}
          </p>
          <div className="mt-4">
            <Link
              href="/learn"
              className="text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              Open Learn path →
            </Link>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
            Access
          </p>
          <p className="text-lg font-semibold text-[var(--color-ink)]">
            {paid ? "Active" : "Locked"}
          </p>
          {!paid ? (
            <div className="mt-2 flex flex-col items-end gap-2">
              <CheckoutButton label="Get access" />
              <Link
                href={marketingUrl("/#pricing")}
                className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                View pricing details
              </Link>
            </div>
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
            <CheckoutButton label="Continue to checkout" />
            <Link
              href={marketingUrl("/#pricing")}
              className="inline-flex items-center text-sm font-medium text-[var(--color-accent)] hover:underline"
            >
              View pricing details
            </Link>
          </div>
        </Card>
      ) : null}
    </main>
  );
}
