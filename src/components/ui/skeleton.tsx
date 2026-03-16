import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--surface-muted)_85%,white)]",
        className,
      )}
      {...props}
    />
  );
}
