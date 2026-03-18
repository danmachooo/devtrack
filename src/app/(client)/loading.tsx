import { Card } from "@/components/ui/card";

export default function ClientLoading() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <div className="h-5 w-28 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="h-12 w-56 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="h-3 w-full animate-pulse rounded bg-[var(--surface-muted)]" />
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface)]" />
        ))}
      </div>
    </div>
  );
}
