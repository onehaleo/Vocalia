import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { marketingUrl } from "@/lib/site";

function SignupFallback() {
  return (
    <Card className="mx-auto max-w-md animate-pulse">
      <div className="h-6 w-40 rounded bg-black/[0.06]" />
      <div className="mt-4 h-4 w-full rounded bg-black/[0.04]" />
      <div className="mt-6 h-10 w-full rounded bg-black/[0.04]" />
    </Card>
  );
}

export default async function SignupPage() {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Suspense fallback={<SignupFallback />}>
        <SignupForm />
      </Suspense>
      <p className="mt-8 text-center text-sm text-[var(--color-ink-muted)]">
        <Link href={marketingUrl("/")} className="hover:text-[var(--color-ink)]">
          ← Back to Vocalia
        </Link>
      </p>
    </main>
  );
}
