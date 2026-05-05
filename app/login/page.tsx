import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { Card } from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { marketingUrl } from "@/lib/site";
import { firstSearchParam } from "@/lib/search-params";

function LoginFallback() {
  return (
    <Card className="mx-auto max-w-md animate-pulse">
      <div className="h-6 w-32 rounded bg-black/[0.06]" />
      <div className="mt-4 h-4 w-full rounded bg-black/[0.04]" />
      <div className="mt-6 h-10 w-full rounded bg-black/[0.04]" />
    </Card>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const authError = firstSearchParam(params.error);

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
      {authError ? (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-red-600" role="alert">
          Something went wrong confirming your email. Try the link again or log in manually.
        </p>
      ) : null}
      <p className="mt-8 text-center text-sm text-[var(--color-ink-muted)]">
        <Link href={marketingUrl("/")} className="hover:text-[var(--color-ink)]">
          ← Back to Vocalia
        </Link>
      </p>
    </main>
  );
}
