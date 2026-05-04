import Link from "next/link";
import { LinkButton } from "@/components/ui/button";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[var(--color-surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-[var(--color-ink)]">
          Vocalia
        </Link>
        <nav className="flex items-center gap-2 text-sm sm:gap-4">
          <Link
            href="/pricing"
            className="hidden text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] sm:inline"
          >
            Pricing
          </Link>
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
                href="/login"
                className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              >
                Log in
              </Link>
              <LinkButton href="/signup" variant="primary" className="px-3 py-2 sm:px-4">
                Sign up
              </LinkButton>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
