import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CheckoutButton } from "@/components/marketing/checkout-button";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";
import { marketingUrl } from "@/lib/site";
import { firstSearchParam } from "@/lib/search-params";

const errorCopy: Record<string, { title: string; body: string }> = {
  missing_price_id: {
    title: "Stripe Price ID is not set",
    body: "Add STRIPE_PRICE_ID to your .env.local. In Stripe Dashboard → Products, create a product with a one-time price, then copy the Price ID (starts with price_). Restart npm run dev after saving.",
  },
  missing_stripe_secret: {
    title: "Stripe secret key is missing",
    body: "Add STRIPE_SECRET_KEY to .env.local (test key sk_test_… from Developers → API keys). Restart the dev server.",
  },
  stripe_api: {
    title: "Stripe rejected the checkout request",
    body: "Common causes: STRIPE_PRICE_ID is a subscription price but the app uses one-time mode; wrong account; or typo in the price ID. See the technical detail below.",
  },
  no_checkout_url: {
    title: "Checkout session had no URL",
    body: "Stripe returned a session without a checkout URL. Check your Stripe dashboard and API version.",
  },
  invalid_price_config: {
    title: "Price / product configuration",
    body: "STRIPE_PRICE_ID must be a one-time price (price_…) or a product (prod_…) whose default or first active price is one-time. See the technical detail below.",
  },
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkout?: string | string[];
    payment?: string | string[];
    code?: string | string[];
    detail?: string | string[];
    from?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const checkout = firstSearchParam(params.checkout);
  const payment = firstSearchParam(params.payment);
  const code = firstSearchParam(params.code);
  const detailRaw = firstSearchParam(params.detail);
  const from = firstSearchParam(params.from);

  const cancelled = payment === "cancelled" || checkout === "cancel";
  const errored = checkout === "error";
  const errInfo = code ? errorCopy[code] : null;
  const detail = detailRaw ? decodeURIComponent(detailRaw) : null;
  const blockedPaidContent = from === "paid-content";

  const { user, profile } = await getProfile();
  const hasPaidAccess = !!profile?.has_paid_access;
  if (hasPaidAccess) {
    redirect("/dashboard");
  }

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
          Beta access
        </h1>
        <p className="mt-3 text-[var(--color-ink-muted)]">
          Access to lessons, phrases, and practice requires the Vocalia beta checkout.
        </p>

        {blockedPaidContent ? (
          <p className="mt-6 rounded-xl border border-[var(--color-accent)]/25 bg-[var(--color-accent-muted)]/35 px-4 py-3 text-sm text-[var(--color-ink)]">
            That area is for paying learners. Complete checkout below (while logged into the same account
            you used to start the link), then open your level or lesson again from the dashboard.
          </p>
        ) : null}

        {cancelled ? (
          <p className="mt-6 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Checkout was cancelled. You can try again whenever you are ready.
          </p>
        ) : null}

        {errored ? (
          <div className="mt-6 rounded-xl border border-red-200/90 bg-red-50 px-4 py-3 text-sm text-red-950">
            <p className="font-semibold">{errInfo?.title ?? "Checkout could not start"}</p>
            <p className="mt-2">{errInfo?.body ?? "Try again or check the server terminal for errors."}</p>
            {detail ? (
              <pre className="mt-3 max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-white/80 p-3 text-xs text-red-900">
                {detail}
              </pre>
            ) : null}
          </div>
        ) : null}

        <Card className="mt-10">
          <h2 className="text-xl font-semibold text-[var(--color-ink)]">Beta access required</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            You&apos;re close — complete the beta checkout to unlock the curriculum.
          </p>

          <div className="mt-8 border-t border-black/[0.06] pt-6">
            {user ? (
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Continue to checkout using the same account where you&apos;ll read your access on the dashboard.
                </p>
                <CheckoutButton />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <LinkButton
                    href={marketingUrl("/#pricing")}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Get beta access
                  </LinkButton>
                  <Link
                    href={marketingUrl("/")}
                    className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    Back to Vocalia
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Create an account to continue, then complete checkout to unlock beta access.
                </p>
                <div className="space-y-3">
                  <LinkButton href="/signup" variant="primary" className="w-full">
                    Sign up
                  </LinkButton>
                  <LinkButton href="/login" variant="secondary" className="w-full">
                    Log in
                  </LinkButton>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <LinkButton
                    href={marketingUrl("/#pricing")}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Get beta access
                  </LinkButton>
                  <Link
                    href={marketingUrl("/")}
                    className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  >
                    Back to Vocalia
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>

        <p className="mt-8 text-xs text-[var(--color-ink-muted)]">
          After Stripe confirms payment, the webhook flips{" "}
          <code className="rounded bg-black/[0.06] px-1">has_paid_access</code> on your Supabase profile.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
