import { SiteFooter } from "@/components/marketing/site-footer";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Privacy Policy</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Last updated: May 2026</p>

        <div className="mt-8 space-y-5">
          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">What Vocalia is</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Vocalia is a beta-stage language-learning product focused on practical communication and
              pronunciation-first training.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Information we collect</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-muted)]">
              <li>• Account information: name and email.</li>
              <li>
                • Payment information: processed by Stripe. Vocalia does not store full card details.
              </li>
              <li>• Learning progress: lessons, phrases, and practice status.</li>
              <li>• Technical data: basic logs/analytics needed to operate and improve the product.</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">How we use information</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-ink-muted)]">
              <li>• Provide accounts and course access.</li>
              <li>• Process payments and maintain billing-related access.</li>
              <li>• Improve course quality and product experience.</li>
              <li>• Respond to support requests and beta feedback.</li>
            </ul>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Payments</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Payments are handled by Stripe. Card details are processed by Stripe and are not stored directly
              by Vocalia.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Data sharing</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              We do not sell personal information. Data may be shared with service providers needed to run the
              product, such as hosting, database, payments, analytics, or email tooling.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Beta product note</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Vocalia is in beta. Features and flows may change as we improve course quality and reliability.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Your choices</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              You can contact Vocalia to ask questions about your account or request account/data deletion.
            </p>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Contact</h2>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">hello@speakvocalia.com</p>
          </Card>
        </div>

        <p className="mt-8 text-xs text-[var(--color-ink-muted)]">
          This policy is provided for transparency and should be reviewed before a full public launch.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
