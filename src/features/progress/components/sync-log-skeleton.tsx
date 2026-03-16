export function SyncLogSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]"
        />
      ))}
    </div>
  );
}
