import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="h-8 w-64 animate-pulse rounded bg-black/[0.06]" />
      <div className="mt-3 h-4 w-full max-w-md animate-pulse rounded bg-black/[0.04]" />
      <Card className="mt-10 animate-pulse space-y-3">
        <div className="h-5 w-40 rounded bg-black/[0.06]" />
        <div className="h-3 w-full rounded bg-black/[0.04]" />
        <div className="h-2 w-full rounded bg-black/[0.06]" />
      </Card>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="h-48 animate-pulse bg-black/[0.02]" />
        ))}
      </div>
    </main>
  );
}
