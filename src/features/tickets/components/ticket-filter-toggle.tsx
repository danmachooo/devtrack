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
    <label
      className={`flex items-start gap-3 rounded-[var(--radius-lg)] border px-4 py-3.5 transition duration-200 shadow-[var(--shadow-sm)] ${
        checked
          ? "border-[color:color-mix(in_srgb,var(--primary)_28%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_10%,var(--surface))_0%,var(--surface)_100%)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[color:color-mix(in_srgb,var(--primary)_20%,var(--border))] hover:bg-[color:color-mix(in_srgb,var(--surface)_92%,var(--background))]"
      }`}
    >
      <input
        checked={checked}
        className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium leading-5">{label}</span>
        <span className="block text-sm leading-6 text-[var(--foreground-muted)]">{description}</span>
      </span>
    </label>
  );
}
