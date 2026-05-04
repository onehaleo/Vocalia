import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getPhrasesForPractice } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { SKILL_LABELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

const modes = [
  { skill: "speaking", slug: "speaking", blurb: "Phrase prompts with self-check — no automatic scoring." },
  { skill: "listening", slug: "listening", blurb: "Listen-and-choose style activities from your course." },
  { skill: "reading", slug: "reading", blurb: "Meaning checks and matching from published lessons." },
  { skill: "writing", slug: "writing", blurb: "Type missing words and short translations." },
  { skill: "pronunciation", slug: "pronunciation", blurb: "Sound-focused drills and the pronunciation lab." },
] as const;

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string | string[] }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const raw = Array.isArray(sp.skill) ? sp.skill[0] : sp.skill;
  const skill = raw && raw !== "all" ? raw : null;

  const paid = !!profile?.has_paid_access;
  const phrases = paid ? await getPhrasesForPractice(paid, skill, 24) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Practice</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Skill modes</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Calm repetition from your seeded course. Filters narrow the phrase pool by lesson activities tagged with each skill.
      </p>

      {!paid ? (
        <Card className="mt-8 text-sm text-[var(--color-ink-muted)]">
          Unlock Vocalia to run practice with your saved phrase progress.{" "}
          <Link href="/pricing" className="font-medium text-[var(--color-accent)] hover:underline">
            View pricing
          </Link>
        </Card>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        <LinkButton href="/practice" variant={!skill ? "primary" : "secondary"} className="px-3 py-2 text-xs sm:text-sm">
          All skills
        </LinkButton>
        {modes.map((m) => (
          <LinkButton
            key={m.slug}
            href={`/practice?skill=${m.skill}`}
            variant={skill === m.skill ? "primary" : "secondary"}
            className="px-3 py-2 text-xs sm:text-sm"
          >
            {SKILL_LABELS[m.skill] ?? m.skill}
          </LinkButton>
        ))}
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Modes</h2>
        <div className="space-y-3">
          {modes.map((m) => (
            <Card key={m.slug} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[var(--color-ink)]">{SKILL_LABELS[m.skill] ?? m.skill}</h3>
                <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{m.blurb}</p>
              </div>
              <LinkButton href={`/practice?skill=${m.skill}`} variant="secondary" className="shrink-0 self-start">
                Open
              </LinkButton>
            </Card>
          ))}
        </div>
        <Card className="border-[var(--color-accent)]/20 bg-[var(--color-accent-muted)]/25">
          <h3 className="text-base font-semibold text-[var(--color-ink)]">Pronunciation lab</h3>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            European Portuguese sound topics — explanations, approximations, and repeat placeholders.
          </p>
          <LinkButton href="/practice/pronunciation" variant="primary" className="mt-4">
            Enter lab
          </LinkButton>
        </Card>
      </section>

      {paid ? (
        <section className="mt-12 space-y-4">
          <h2 className="text-lg font-semibold text-[var(--color-ink)]">Phrase pool{skill ? ` · ${SKILL_LABELS[skill] ?? skill}` : ""}</h2>
          {phrases.length === 0 ? (
            <Card className="text-sm text-[var(--color-ink-muted)]">No phrases matched this filter yet.</Card>
          ) : (
            <ul className="space-y-3">
              {phrases.map((p) => (
                <li key={p.id}>
                  <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-[var(--color-ink)]">{p.phrase}</p>
                      <p className="text-sm text-[var(--color-ink-muted)]">{p.translation}</p>
                      <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {p.lessonTitle} · {p.levelCode}
                      </p>
                    </div>
                    <LinkButton
                      href={`/learn/${p.levelCode}/${p.moduleSlug}/${p.lessonSlug}`}
                      variant="secondary"
                      className="shrink-0 self-start"
                    >
                      Open lesson
                    </LinkButton>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </main>
  );
}
