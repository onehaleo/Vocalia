"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 sm:px-6">
      <Card className="w-full text-center">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">Something went wrong</h1>
        <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
          {error.message || "An unexpected error occurred."}
        </p>
        <Button type="button" variant="primary" className="mt-6" onClick={() => reset()}>
          Try again
        </Button>
      </Card>
    </main>
  );
}
