type SyncMetricProps = {
  label: string;
  value: string;
};

export function SyncMetric({ label, value }: SyncMetricProps) {
  return (
    <div className="min-w-28 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
