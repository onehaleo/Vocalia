import { Card } from "@/components/ui/card";

export default function LessonLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-4 w-32 animate-pulse rounded bg-black/[0.04]" />
      <div className="mt-2 h-10 w-3/4 animate-pulse rounded bg-black/[0.06]" />
      <div className="mt-10 space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-64 animate-pulse bg-black/[0.02]" />
        ))}
      </div>
    </main>
  );
}
