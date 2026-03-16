type TicketMetaItemProps = {
  label: string;
  value: string;
};

export function TicketMetaItem({ label, value }: TicketMetaItemProps) {
  return (
    <div className="space-y-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-muted)]">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
