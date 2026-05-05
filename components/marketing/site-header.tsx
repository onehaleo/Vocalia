"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/button";
import { betaUrl } from "@/lib/site";

const learnNav = [
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/review", label: "Review" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/progress", label: "Progress" },
];

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const isMarketingHome = !signedIn && pathname === "/";

  const betaPricing = betaUrl("/pricing");
  const betaLogin = betaUrl("/login");
  const betaSignup = betaUrl("/signup");

  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
            Vocalia
          </Link>
          {signedIn ? (
            <nav className="hidden flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm sm:flex md:gap-x-4">
              {learnNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : isMarketingHome ? (
            <nav className="hidden flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm sm:flex md:gap-x-4">
              <Link href="/#how-it-works" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                How it works
              </Link>
              <Link
                href="/#what-youll-learn"
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                What you&apos;ll learn
              </Link>
              <Link href="/#pricing" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                Pricing
              </Link>
              <Link href="/#faq" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                FAQ
              </Link>
            </nav>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end">
          {signedIn ? (
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:hidden">
              {learnNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : isMarketingHome ? (
            <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm sm:hidden">
              <Link href="/#how-it-works" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                How it works
              </Link>
              <Link
                href="/#what-youll-learn"
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                What you&apos;ll learn
              </Link>
              <Link href="/#pricing" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                Pricing
              </Link>
              <Link href="/#faq" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                FAQ
              </Link>
            </nav>
          ) : null}
          <nav className="flex items-center gap-2 text-sm sm:gap-4">
            {!isMarketingHome ? (
              <Link
                href={signedIn ? "/pricing" : betaPricing}
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                Pricing
              </Link>
            ) : null}
            {signedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  Dashboard
                </Link>
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="rounded-lg px-2 py-1 text-[var(--color-ink-muted)] hover:bg-black/[0.04] hover:text-[var(--color-ink)]"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href={betaLogin}
                  className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                >
                  Log in
                </Link>
                <LinkButton href={betaSignup} variant="primary" className="px-3 py-2 sm:px-4">
                  Join beta
                </LinkButton>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
