type TicketFilterToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function TicketFilterToggle({
  label,
  description,
  checked,
  onChange,
}: TicketFilterToggleProps) {
  return (
    <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
      <input
        checked={checked}
        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-sm text-[var(--foreground-muted)]">{description}</span>
      </span>
    </label>
  );
}
