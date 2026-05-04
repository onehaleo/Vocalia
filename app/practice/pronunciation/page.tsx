import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getSoundLessons } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { AudioPlaceholderBar } from "@/components/learning/audio-placeholders";

export const dynamic = "force-dynamic";

type SoundBody = {
  explanation?: string;
  englishApproximation?: string;
  mouthPosition?: string;
  commonMistakes?: string;
  exampleWords?: string[];
  examplePhrases?: string[];
};

export default async function PronunciationLabPage() {
  const { user } = await getProfile();
  if (!user) redirect("/login");

  const lessons = await getSoundLessons();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link href="/practice" className="text-sm font-medium text-[var(--color-accent)] hover:underline">
        ← Practice
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
        Pronunciation lab
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">European Portuguese sounds</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Short coaching notes and placeholders for slow and natural audio. Add real URLs in the catalog when you are ready.
      </p>

      <section className="mt-10 space-y-6">
        {lessons.length === 0 ? (
          <Card className="text-sm text-[var(--color-ink-muted)]">No sound lessons in seed data.</Card>
        ) : (
          lessons.map((s) => {
            const b = (s.body ?? {}) as SoundBody;
            return (
              <Card key={s.id} className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-ink)]">{s.title}</h2>
                  {s.summary ? <p className="mt-2 text-sm text-[var(--color-ink-muted)]">{s.summary}</p> : null}
                </div>
                <AudioPlaceholderBar label="Model pronunciation" />
                {b.explanation ? (
                  <p className="text-sm text-[var(--color-ink)]">
                    <span className="font-medium">Explanation: </span>
                    {b.explanation}
                  </p>
                ) : null}
                {b.englishApproximation ? (
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    <span className="font-medium text-[var(--color-ink)]">English approximation: </span>
                    {b.englishApproximation}
                  </p>
                ) : null}
                {b.mouthPosition ? (
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    <span className="font-medium text-[var(--color-ink)]">Mouth position: </span>
                    {b.mouthPosition}
                  </p>
                ) : null}
                {b.commonMistakes ? (
                  <p className="text-sm text-[var(--color-ink-muted)]">
                    <span className="font-medium text-[var(--color-ink)]">Common mistakes: </span>
                    {b.commonMistakes}
                  </p>
                ) : null}
                {b.exampleWords && b.exampleWords.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--color-ink-muted)]">Example words</p>
                    <p className="mt-1 text-sm text-[var(--color-ink)]">{b.exampleWords.join(" · ")}</p>
                  </div>
                ) : null}
                {b.examplePhrases && b.examplePhrases.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase text-[var(--color-ink-muted)]">Example phrases</p>
                    <ul className="mt-1 list-inside list-disc text-sm text-[var(--color-ink)]">
                      {b.examplePhrases.map((line) => (
                        <li key={line}>{line}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </section>
    </main>
  );
}
