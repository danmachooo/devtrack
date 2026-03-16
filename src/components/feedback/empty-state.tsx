import { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  icon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, icon }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-start gap-4 p-6">
      {icon ? <div className="text-[var(--primary)]">{icon}</div> : null}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
      </div>
      {actionLabel ? <Button variant="secondary">{actionLabel}</Button> : null}
    </Card>
  );
}
