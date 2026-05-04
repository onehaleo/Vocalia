import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/[0.06] bg-white py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-[var(--color-ink)]">Vocalia</p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            European Portuguese pronunciation for English speakers.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-ink-muted)]">
          <Link href="/pricing" className="hover:text-[var(--color-ink)]">
            Pricing
          </Link>
          <Link href="/login" className="hover:text-[var(--color-ink)]">
            Log in
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl px-4 text-center text-xs text-[var(--color-ink-muted)] sm:px-6">
        Seed content is illustrative — verify with a tutor before relying on it for official situations.
      </p>
    </footer>
  );
}
