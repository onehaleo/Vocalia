import Link from "next/link";
import { SiteFooter } from "@/components/marketing/site-footer";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { betaUrl, marketingUrl } from "@/lib/site";

export default function ContactPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Contact Vocalia</h1>
        <p className="mt-3 text-[var(--color-ink-muted)]">
          Have a question, found an issue, or want to share beta feedback?
        </p>

        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Email</h2>
          <p className="mt-2 text-sm text-[var(--color-ink-muted)]">hello@speakvocalia.com</p>
        </Card>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">Support</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Login problems, account questions, and access issues.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">Billing/access issues</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Checkout, payment, and beta access support.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">Beta feedback</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Share product ideas, UX pain points, and suggestions.
            </p>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-[var(--color-ink)]">Course corrections</h3>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Report language corrections or pronunciation notes.
            </p>
          </Card>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <LinkButton href={marketingUrl("/")} variant="secondary">
            Back to Vocalia
          </LinkButton>
          <LinkButton href={betaUrl("/signup")} variant="primary">
            Join beta
          </LinkButton>
        </div>

        <p className="mt-6 text-sm text-[var(--color-ink-muted)]">
          Prefer email? Contact{" "}
          <Link href="mailto:hello@speakvocalia.com" className="font-medium text-[var(--color-accent)] hover:underline">
            hello@speakvocalia.com
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
