import {
  getFeatureProgressStatusLabel,
  getFeatureProgressTone,
} from "@/features/progress/progress-utils";
import type { FeatureProgressStatus } from "@/types/api";

type FeatureStatusPillProps = {
  status: FeatureProgressStatus;
};

export function FeatureStatusPill({ status }: FeatureStatusPillProps) {
  const tone = getFeatureProgressTone(status);
  const toneClasses = {
    success:
      "border-[color:color-mix(in_srgb,var(--success)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
    warning:
      "border-[color:color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
    neutral: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {getFeatureProgressStatusLabel(status)}
    </span>
  );
}
