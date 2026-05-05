import { SiteFooter } from "@/components/marketing/site-footer";
import { Card } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Terms of Use</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Last updated: May 2026</p>

        <div className="mt-8 space-y-5">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Acceptance of terms</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              By creating an account or using Vocalia, you agree to these terms.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">What Vocalia provides</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Vocalia provides language-learning content and pronunciation practice tools, including beta access
              to European Portuguese course content.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Beta status</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Vocalia is in beta. Content is expanding and features may change. Some content may be adjusted,
              corrected, or expanded over time.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Payments and access</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Beta access is currently a one-time purchase unless otherwise stated at checkout. Access is tied
              to your user account. Stripe handles payment processing.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Refunds and support</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Contact hello@speakvocalia.com for billing or access issues. During beta, refund requests are
              reviewed case by case.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Educational disclaimer</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Vocalia is not an official CEFR certification provider and does not guarantee fluency, exam
              results, immigration outcomes, employment outcomes, or official language certification.
              Pronunciation guidance is educational and may be refined over time.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Acceptable use</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              You agree not to misuse the service, scrape content at scale, copy/resell materials, or disrupt
              the platform.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Intellectual property</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Vocalia content, design, lessons, and materials belong to Vocalia unless otherwise stated.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Account responsibility</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              You are responsible for maintaining the confidentiality of your login credentials.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Changes to terms</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              These terms may be updated as the product evolves. The latest version will be posted on this page.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Contact</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">hello@speakvocalia.com</p>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
