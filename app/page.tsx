import { SiteFooter } from "@/components/marketing/site-footer";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const benefits = [
  {
    title: "Learn how words actually sound",
    body: "Phonetic guides tuned for English speakers, not textbook IPA alone.",
  },
  {
    title: "Practice real expat phrases",
    body: "Coffee, housing, SEF queues — language you will use this week.",
  },
  {
    title: "Mouth placement and rhythm",
    body: "Short notes on stress, nasals, and pacing so you sound less translated.",
  },
  {
    title: "Track progress A1 → B2",
    body: "Clear levels, lessons, and phrase status without noisy gamification.",
  },
];

const faqs = [
  {
    q: "Is this European or Brazilian Portuguese?",
    a: "European Portuguese (Portugal) is the first track. The architecture is ready for more dialects and languages later.",
  },
  {
    q: "Do I need prior Portuguese?",
    a: "A1 assumes zero Portuguese but comfortable English reading. You grow into B2 nuance over time.",
  },
  {
    q: "Is there speech recognition?",
    a: "Not in the MVP. You self-mark phrases as practicing or mastered while we focus on listening and repetition.",
  },
  {
    q: "Can I cancel later?",
    a: "The MVP ships as a one-time purchase for lifetime access to this curriculum slice. Subscriptions can be layered on later in Stripe.",
  },
];

export default function HomePage() {
  return (
    <>
      <main>
        <section className="border-b border-black/[0.06] bg-gradient-to-b from-white to-[var(--color-surface)] px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-[var(--color-accent)]">
              European Portuguese pronunciation for real life
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl">
              Sound clear, calm, and local — without living in apps all day.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-[var(--color-ink-muted)]">
              Vocalia breaks phrases into sounds you can hear, imitate, and reuse in Lisbon, Porto, or anywhere you show up with a learner badge and a resident visa.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/signup" variant="primary" className="w-full min-w-[200px] sm:w-auto">
                Start learning
              </LinkButton>
              <LinkButton href="/pricing" variant="secondary" className="w-full min-w-[200px] sm:w-auto">
                Get access
              </LinkButton>
            </div>
            <p className="mt-6 text-xs text-[var(--color-ink-muted)]">
              Seed curriculum — content is plausible but not a substitute for a human tutor.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">
            Built for adults who want results, not noise
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-ink-muted)]">
            Minimal UI, mobile-first layouts, and lessons you can finish in a coffee break. Join the beta cohort and shape what ships next.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {benefits.map((b) => (
              <Card key={b.title}>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">{b.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{b.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-black/[0.06] bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Simple pricing for the MVP</h2>
            <p className="mt-3 text-[var(--color-ink-muted)]">
              One payment unlocks the full published curriculum for European Portuguese at launch.
            </p>
            <div className="mt-8">
              <Card className="mx-auto max-w-md text-left">
                <p className="text-sm font-medium text-[var(--color-accent)]">Founding access</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">€49</p>
                <p className="text-sm text-[var(--color-ink-muted)]">one-time · illustrative price in UI</p>
                <ul className="mt-4 space-y-2 text-sm text-[var(--color-ink-muted)]">
                  <li>✓ A1–B2 published lessons and phrases</li>
                  <li>✓ Phonetic breakdowns and common mistake notes</li>
                  <li>✓ Progress tracking across levels</li>
                </ul>
                <LinkButton href="/pricing" variant="primary" className="mt-6 w-full">
                  View pricing & checkout
                </LinkButton>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">FAQ</h2>
          <dl className="mt-10 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium text-[var(--color-ink)]">{f.q}</dt>
                <dd className="mt-2 text-sm text-[var(--color-ink-muted)]">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/[0.06] bg-[var(--color-surface)]/95 p-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <LinkButton href="/signup" variant="primary" className="flex-1">
            Start learning
          </LinkButton>
          <LinkButton href="/pricing" variant="secondary" className="flex-1">
            Get access
          </LinkButton>
        </div>
      </div>

      <div className="h-20 md:h-0" aria-hidden />

      <SiteFooter />
    </>
  );
}
