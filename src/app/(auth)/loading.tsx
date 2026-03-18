import { Card } from "@/components/ui/card";

export default function AuthLoading() {
  return (
    <Card className="space-y-4 p-8">
      <div className="h-4 w-32 animate-pulse rounded bg-[var(--surface-muted)]" />
      <div className="h-8 w-52 animate-pulse rounded bg-[var(--surface-muted)]" />
      <div className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
      <div className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
      <div className="h-11 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
    </Card>
  );
}
