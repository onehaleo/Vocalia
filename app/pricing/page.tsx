import { redirect } from "next/navigation";
import { CheckoutButton } from "@/components/billing/checkout-button";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/lib/auth";
import { marketingUrl } from "@/lib/site";

export default async function PricingPage() {
  const { user, profile } = await getProfile();

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Card>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Create an account to get access</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
            Vocalia checkout is attached to your account. Sign up or log in first, then continue to checkout.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/signup" variant="primary" className="w-full sm:w-auto">
              Create account
            </LinkButton>
            <LinkButton href="/login" variant="secondary" className="w-full sm:w-auto">
              Log in
            </LinkButton>
          </div>
          <div className="mt-4">
            <LinkButton href={marketingUrl("/#pricing")} variant="secondary" className="w-full sm:w-auto">
              View pricing on Vocalia
            </LinkButton>
          </div>
        </Card>
      </main>
    );
  }

  if (profile?.has_paid_access) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <Card>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Beta access required</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          Unlock Vocalia Portuguese to continue learning.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <CheckoutButton label="Continue to checkout" />
          <LinkButton href={marketingUrl("/#pricing")} variant="secondary" className="w-full sm:w-auto">
            View pricing details
          </LinkButton>
        </div>
      </Card>
    </main>
  );
}
