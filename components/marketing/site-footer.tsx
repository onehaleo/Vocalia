import Link from "next/link";
import { betaUrl, marketingUrl } from "@/lib/site";

export function SiteFooter() {
  const betaRoot = betaUrl("/");
  const betaLogin = betaUrl("/login");
  const marketingPricing = marketingUrl("/#pricing");

  return (
    <footer className="border-t border-black/[0.06] bg-white py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-[var(--color-ink)]">Vocalia</p>
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            Learn the language. Sound natural from day one.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-ink-muted)]">
          <Link href={betaRoot} className="hover:text-[var(--color-ink)]">
            Beta app
          </Link>
          <Link href={betaLogin} className="hover:text-[var(--color-ink)]">
            Log in
          </Link>
          <Link href={marketingPricing} className="hover:text-[var(--color-ink)]">
            Pricing
          </Link>
          <Link href="mailto:hello@speakvocalia.com" className="hover:text-[var(--color-ink)]">
            Contact
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-5xl px-4 text-center text-xs text-[var(--color-ink-muted)] sm:px-6">
        Vocalia is an independent language-learning product and is not an official CEFR certification provider.
      </p>
    </footer>
  );
}
