import Link from "next/link";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6">
      <Card className="w-full text-center">
        <p className="text-sm font-medium text-[var(--color-accent)]">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">Page not found</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          That lesson or level does not exist, or your account does not have access yet.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton href="/dashboard" variant="primary">
            Dashboard
          </LinkButton>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          >
            Home
          </Link>
        </div>
      </Card>
    </main>
  );
}
