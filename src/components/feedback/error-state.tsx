import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ErrorStateProps = {
  title?: string;
  description?: string;
  actionLabel?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "The page could not be loaded right now. Try again in a moment.",
  actionLabel = "Try Again",
}: ErrorStateProps) {
  return (
    <Card className="border-[color:color-mix(in_srgb,var(--danger)_50%,var(--border))] p-6">
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
        <Button variant="secondary">{actionLabel}</Button>
      </div>
    </Card>
  );
}
