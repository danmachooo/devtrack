import type { SyncLogStatus } from "@/types/api";

type SyncStatusPillProps = {
  status: SyncLogStatus;
};

export function SyncStatusPill({ status }: SyncStatusPillProps) {
  const toneClasses = {
    SUCCESS:
      "border-[color:color-mix(in_srgb,var(--success)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
    FAILED:
      "border-[color:color-mix(in_srgb,var(--danger)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
    RATE_LIMITED:
      "border-[color:color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[status]}`}
    >
      {status === "RATE_LIMITED" ? "Rate limited" : status.toLowerCase()}
    </span>
  );
}
