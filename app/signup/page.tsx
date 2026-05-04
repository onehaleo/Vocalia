import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <SignupForm />
      <p className="mt-8 text-center text-sm text-[var(--color-ink-muted)]">
        <Link href="/" className="hover:text-[var(--color-ink)]">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
