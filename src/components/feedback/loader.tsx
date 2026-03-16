export function Loader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-[var(--foreground-muted)]">
      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary)]" />
      <span>{label}</span>
    </div>
  );
}
