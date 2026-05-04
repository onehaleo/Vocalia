import { Card } from "@/components/ui/card";

export default function LevelLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-6 w-24 animate-pulse rounded bg-black/[0.06]" />
      <div className="mt-2 h-9 w-2/3 max-w-md animate-pulse rounded bg-black/[0.06]" />
      <div className="mt-10 space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-24 animate-pulse bg-black/[0.02]" />
        ))}
      </div>
    </main>
  );
}
