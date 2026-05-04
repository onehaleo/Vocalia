import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { CheckoutButton } from "@/components/marketing/checkout-button";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const user = await getUser();
  const params = await searchParams;
  const cancelled = params.checkout === "cancel";

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Pricing</h1>
        <p className="mt-3 text-[var(--color-ink-muted)]">
          MVP access is a one-time checkout. Subscriptions can reuse the same Stripe customer later.
        </p>

        {cancelled ? (
          <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Checkout was cancelled. You can try again whenever you are ready.
          </p>
        ) : null}

        <Card className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Vocalia — full curriculum access</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Pay once, keep access to the published European Portuguese track as it grows during beta.
          </p>
          <p className="mt-6 text-4xl font-semibold text-[var(--color-ink)]">€49</p>
          <p className="text-sm text-[var(--color-ink-muted)]">Placeholder UI price — set your real amount in Stripe.</p>

          <ul className="mt-6 space-y-2 text-sm text-[var(--color-ink)]">
            <li>Levels A1–B2 with lessons and phrase drills</li>
            <li>Phonetic scaffolding and mistake callouts</li>
            <li>Optional native audio URLs per phrase (add your own hosting links)</li>
          </ul>

          <div className="mt-8 border-t border-black/[0.06] pt-6">
            {user ? (
              <CheckoutButton />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Create an account first — checkout attaches to your Vocalia profile.
                </p>
                <LinkButton href="/signup" variant="primary">
                  Sign up to purchase
                </LinkButton>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Already registered?{" "}
                  <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
                    Log in
                  </Link>
                </p>
              </div>
            )}
          </div>
        </Card>

        <p className="mt-8 text-xs text-[var(--color-ink-muted)]">
          After Stripe confirms payment, the webhook flips <code className="rounded bg-black/[0.06] px-1">has_paid_access</code>{" "}
          on your Supabase profile. You will be redirected back to the dashboard.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
