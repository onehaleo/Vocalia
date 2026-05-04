import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm shadow-black/[0.03]",
        className,
      )}
    >
      {children}
    </div>
  );
}
