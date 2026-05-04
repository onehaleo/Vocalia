"use client";

import { Button } from "@/components/ui/button";

export function AudioPlaceholderBar({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      {label ? <p className="text-sm text-[var(--color-ink-muted)]">{label}</p> : <span />}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="text-sm" disabled>
          Slow (soon)
        </Button>
        <Button type="button" variant="secondary" className="text-sm" disabled>
          Natural (soon)
        </Button>
        <Button type="button" variant="secondary" className="text-sm" disabled>
          In context (soon)
        </Button>
      </div>
    </div>
  );
}
