import { SiteFooter } from "@/components/marketing/site-footer";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { betaUrl } from "@/lib/site";

const whyCards = [
  {
    title: "Native pronunciation from the start",
    body: "Hear stress, rhythm, and mouth movement from lesson one, not as an afterthought.",
  },
  {
    title: "Real-life phrases, not random word lists",
    body: "Practice language you can actually use when ordering, asking, explaining, and navigating daily life.",
  },
  {
    title: "Practice all four skills",
    body: "Build speaking, listening, reading, and writing together so confidence grows in real conversations.",
  },
  {
    title: "Built for adults who want confidence, not streaks",
    body: "Clear progression and practical outcomes, without childish gamification pressure.",
  },
];

const howSteps = [
  {
    step: "1. Learn the phrase",
    body: "Start with practical phrases and short explanations that make sense for first-time learners.",
  },
  {
    step: "2. Hear how it sounds",
    body: "Listen to pronunciation cues and rhythm so you understand what natural speech should feel like.",
  },
  {
    step: "3. Practice saying it",
    body: "Repeat with guided prompts and confidence-based speaking practice designed for adults.",
  },
  {
    step: "4. Use it in real situations",
    body: "Apply each lesson to everyday contexts like shops, appointments, housing, and transport.",
  },
];

const skills = [
  {
    title: "Speaking",
    body: "Guided phrase drills and confidence-first prompts help you speak earlier, not wait for perfection.",
  },
  {
    title: "Listening",
    body: "Train your ear for natural pace, stress, and pronunciation differences from textbook examples.",
  },
  {
    title: "Reading",
    body: "Build practical reading confidence with useful phrases, lesson context, and structured progression.",
  },
  {
    title: "Writing",
    body: "Reinforce grammar and vocabulary through short exercises that mirror real-life communication.",
  },
  {
    title: "Pronunciation Lab",
    body: "Focus on sounds that matter most so you can be understood and sound more natural day to day.",
  },
];

const scenarios = [
  "Ordering coffee",
  "Introducing yourself",
  "Asking for directions",
  "Handling appointments",
  "Explaining a problem",
  "Talking to a landlord",
  "Visiting a pharmacy or vet",
  "Navigating daily life abroad",
];

const faqs = [
  {
    q: "Is Vocalia only for travelers?",
    a: "No. Vocalia is built for first-time language learners, travelers, and future expats who want practical language ability and natural pronunciation.",
  },
  {
    q: "What language is available first?",
    a: "European Portuguese is the first course.",
  },
  {
    q: "Is this Brazilian Portuguese?",
    a: "No. The first course focuses on European Portuguese.",
  },
  {
    q: "Is this a full language course or a phrasebook?",
    a: "Vocalia is designed as a full beginner-first learning path with pronunciation integrated throughout, not just a phrasebook.",
  },
  {
    q: "Does it use speech recognition?",
    a: "The beta currently focuses on guided pronunciation, phrase practice, and self-rated speaking confidence. Recording and AI feedback can be added later.",
  },
  {
    q: "What does beta mean?",
    a: "The product is live and usable, but the course is still expanding. Beta members get early access and help shape what comes next.",
  },
];

export default function HomePage() {
  const betaPricing = betaUrl("/pricing");
  const betaLogin = betaUrl("/login");

  return (
    <>
      <main>
        <section className="border-b border-black/[0.06] bg-gradient-to-b from-white to-[var(--color-surface)] px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-6xl">
              Learn the language. Sound natural from day one.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-lg text-[var(--color-ink-muted)]">
              Vocalia helps first-time language learners build real vocabulary, grammar, listening, speaking,
              reading, and writing skills - with native pronunciation practice built into every lesson.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href={betaPricing} variant="primary" className="w-full min-w-[240px] sm:w-auto">
                Start with European Portuguese
              </LinkButton>
              <LinkButton href="#how-it-works" variant="secondary" className="w-full min-w-[240px] sm:w-auto">
                See how it works
              </LinkButton>
            </div>
            <ul className="mx-auto mt-8 grid max-w-3xl gap-3 text-left text-sm text-[var(--color-ink-muted)] sm:grid-cols-2">
              <li className="rounded-xl border border-black/[0.08] bg-white/90 px-4 py-3">A1 to B2 learning path</li>
              <li className="rounded-xl border border-black/[0.08] bg-white/90 px-4 py-3">
                Pronunciation-first lessons
              </li>
              <li className="rounded-xl border border-black/[0.08] bg-white/90 px-4 py-3">
                Speaking, listening, reading, and writing practice
              </li>
              <li className="rounded-xl border border-black/[0.08] bg-white/90 px-4 py-3">
                Built for real-life conversations
              </li>
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">Why Vocalia</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-[var(--color-ink-muted)]">
            Most apps teach you what words mean. Vocalia teaches you how they actually sound - and how to use
            them in real life.
          </p>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {whyCards.map((card) => (
              <Card key={card.title}>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">{card.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{card.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-black/[0.06] bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">How it works</h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {howSteps.map((item) => (
                <Card key={item.step}>
                  <p className="text-sm font-semibold text-[var(--color-accent)]">{item.step}</p>
                  <p className="mt-3 text-sm text-[var(--color-ink-muted)]">{item.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="what-youll-learn" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">What you&apos;ll practice</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <Card key={skill.title}>
                <h3 className="text-lg font-semibold text-[var(--color-ink)]">{skill.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{skill.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y border-black/[0.06] bg-[var(--color-surface)] px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">First course</h2>
            <p className="mx-auto mt-3 max-w-3xl text-center text-[var(--color-ink-muted)]">
              European Portuguese for English-speaking beginners.
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <h3 className="text-base font-semibold text-[var(--color-ink)]">A1 Foundations</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Live now in beta.</p>
              </Card>
              <Card>
                <h3 className="text-base font-semibold text-[var(--color-ink)]">A2 Daily Independence</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Being expanded.</p>
              </Card>
              <Card>
                <h3 className="text-base font-semibold text-[var(--color-ink)]">B1 Real Conversations</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Being expanded.</p>
              </Card>
              <Card>
                <h3 className="text-base font-semibold text-[var(--color-ink)]">B2 Natural Expression</h3>
                <p className="mt-2 text-sm text-[var(--color-ink-muted)]">Being expanded.</p>
              </Card>
            </div>
            <p className="mt-6 text-center text-sm text-[var(--color-ink-muted)]">
              A1 is the first beta focus, with A2-B2 expanding over time.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="text-center text-2xl font-semibold text-[var(--color-ink)]">Built for real life</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {scenarios.map((scenario) => (
              <div
                key={scenario}
                className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-sm text-[var(--color-ink-muted)]"
              >
                {scenario}
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-y border-black/[0.06] bg-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Beta access</h2>
            <p className="mt-3 text-[var(--color-ink-muted)]">
              Vocalia is in early beta. Join now for access while the European Portuguese course is being expanded.
            </p>
            <p className="mt-3 text-sm text-[var(--color-ink-muted)]">
              A1 is live now. A2-B2 are being expanded. Early beta members help shape what ships next.
            </p>
            <LinkButton href={betaPricing} variant="primary" className="mt-8">
              Get beta access
            </LinkButton>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
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

        <section className="bg-gradient-to-b from-[var(--color-surface)] to-white px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-[var(--color-ink)]">Ready to sound more natural?</h2>
            <p className="mt-3 text-[var(--color-ink-muted)]">
              Join the Vocalia beta and start building practical confidence from day one.
            </p>
            <LinkButton href={betaPricing} variant="primary" className="mt-8">
              Join the Vocalia beta
            </LinkButton>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-black/[0.06] bg-[var(--color-surface)]/95 p-3 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <LinkButton href={betaPricing} variant="primary" className="flex-1">
            Join beta
          </LinkButton>
          <LinkButton href={betaLogin} variant="secondary" className="flex-1">
            Log in
          </LinkButton>
        </div>
      </div>

      <div className="h-20 md:h-0" aria-hidden />

      <SiteFooter />
    </>
  );
}
