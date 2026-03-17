import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: ReactNode;
  children?: ReactNode;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  icon,
  children,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-5 p-6">
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))] text-[var(--primary)] shadow-[var(--shadow-sm)]">
          {icon}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-balance">{title}</h3>
        <p className="max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] text-pretty">
          {description}
        </p>
      </div>
      {actionLabel ? <Button variant="secondary">{actionLabel}</Button> : null}
      {children}
    </Card>
  );
}
