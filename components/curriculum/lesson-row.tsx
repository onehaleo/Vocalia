import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type LessonRowModel = {
  id: string;
  title: string;
  description: string | null;
  sort_order: number;
  status: "not_started" | "in_progress" | "completed";
};

export function LessonListRow({ lesson }: { lesson: LessonRowModel }) {
  const label =
    lesson.status === "completed"
      ? "Completed"
      : lesson.status === "in_progress"
        ? "In progress"
        : "Not started";

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
          {label}
        </p>
        <h3 className="text-base font-semibold text-[var(--color-ink)]">{lesson.title}</h3>
        {lesson.description ? (
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{lesson.description}</p>
        ) : null}
      </div>
      <LinkButton
        href={`/lessons/${lesson.id}`}
        variant={lesson.status === "completed" ? "secondary" : "primary"}
        className="shrink-0 self-start sm:self-center"
      >
        {lesson.status === "not_started" ? "Start" : "Continue"}
      </LinkButton>
    </Card>
  );
}
