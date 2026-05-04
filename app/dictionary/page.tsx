import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { getDictionaryRows } from "@/lib/learning";
import { Card } from "@/components/ui/card";
import { firstSearchParam } from "@/lib/search-params";

export const dynamic = "force-dynamic";

export default async function DictionaryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { user, profile } = await getProfile();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const q = firstSearchParam(sp.q) ?? "";
  const paid = !!profile?.has_paid_access;
  const rows = paid ? await getDictionaryRows(true, q, 100) : [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">Dictionary</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">Phrases & vocabulary</h1>
      <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
        Search Portuguese or English. Entries mirror your course seed — not a full bilingual dictionary.
      </p>

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" action="/dictionary" method="get">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search…"
          className="w-full rounded-xl border border-black/[0.12] bg-white px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Search
        </button>
      </form>

      {!paid ? (
        <Card className="mt-8 text-sm text-[var(--color-ink-muted)]">
          Unlock Vocalia to browse the full searchable phrase catalog from your lessons.
        </Card>
      ) : (
        <ul className="mt-10 space-y-4">
          {rows.length === 0 ? (
            <Card className="text-sm text-[var(--color-ink-muted)]">No entries matched.</Card>
          ) : (
            rows.map((row) => (
              <li key={row.id}>
                <Card className="space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-lg font-semibold text-[var(--color-ink)]">{row.phrase}</p>
                    <span className="text-xs font-medium uppercase text-[var(--color-ink-muted)]">{row.levelCode}</span>
                  </div>
                  <p className="text-sm text-[var(--color-ink-muted)]">{row.translation}</p>
                  <p className="text-sm">
                    <span className="font-medium text-[var(--color-ink)]">Phonetic: </span>
                    <span className="text-[var(--color-ink-muted)]">{row.phonetic}</span>
                  </p>
                  {row.syllable_breakdown ? (
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      <span className="font-medium text-[var(--color-ink)]">Syllables: </span>
                      {row.syllable_breakdown}
                    </p>
                  ) : null}
                  {row.pronunciation_notes ? (
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      <span className="font-medium text-[var(--color-ink)]">Pronunciation notes: </span>
                      {row.pronunciation_notes}
                    </p>
                  ) : null}
                  {row.common_mistakes ? (
                    <p className="text-sm text-[var(--color-ink-muted)]">
                      <span className="font-medium text-[var(--color-ink)]">Common mistakes: </span>
                      {row.common_mistakes}
                    </p>
                  ) : null}
                  {row.tags && row.tags.length > 0 ? (
                    <p className="text-xs text-[var(--color-ink-muted)]">
                      <span className="font-medium text-[var(--color-ink)]">Tags: </span>
                      {row.tags.join(", ")}
                    </p>
                  ) : null}
                  <Link
                    href={`/learn/${row.levelCode}/${row.moduleSlug}/${row.lessonSlug}`}
                    className="inline-block text-sm font-medium text-[var(--color-accent)] hover:underline"
                  >
                    View in lesson →
                  </Link>
                </Card>
              </li>
            ))
          )}
        </ul>
      )}
    </main>
  );
}
