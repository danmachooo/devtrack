type TicketMetaItemProps = {
  label: string;
  value: string;
};

export function TicketMetaItem({ label, value }: TicketMetaItemProps) {
  return (
    <div className="space-y-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_92%,var(--background))] p-3.5">
      <div className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-muted)]">{label}</div>
      <div className="text-sm font-medium leading-6">{value}</div>
    </div>
  );
}
