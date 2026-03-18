import { CheckCircle2, CircleDashed, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  getFeatureWorkspaceStatus,
  type FeatureProgressSnapshot,
} from "@/features/features-management/feature-management.utils";
import type { ProjectFeatureSummary } from "@/types/api";

type FeatureListRowProps = {
  feature: ProjectFeatureSummary;
  isSelected: boolean;
  onSelect: () => void;
  progressSummary?: FeatureProgressSnapshot;
};

export function FeatureListRow({
  feature,
  isSelected,
  onSelect,
  progressSummary,
}: FeatureListRowProps) {
  const status = getFeatureWorkspaceStatus(progressSummary);
  const statusLabel =
    status === "completed" ? "Completed" : status === "active" ? "Active work" : "No assigned work";
  const Icon = status === "completed" ? CheckCircle2 : status === "active" ? Sparkles : CircleDashed;
  const progress = progressSummary?.progress ?? 0;
  const totalTickets = progressSummary?.totalTickets ?? 0;

  return (
    <button
      className={cn(
        "w-full rounded-[var(--radius-lg)] border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:scale-[1.01]",
        isSelected
          ? "border-[color:color-mix(in_srgb,var(--primary)_28%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_10%,var(--surface))_0%,var(--surface)_100%)] shadow-[var(--shadow-sm)]"
          : "border-[var(--border)] bg-[var(--surface)] hover:border-[color:color-mix(in_srgb,var(--primary)_24%,var(--border))] hover:bg-[color:color-mix(in_srgb,var(--surface)_88%,var(--background))] hover:shadow-[var(--shadow-sm)]",
      )}
      onClick={onSelect}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)]">
          <span className="text-xs font-semibold uppercase tracking-[0.16em]">{feature.order + 1}</span>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              #{feature.order + 1}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              {statusLabel}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold leading-6">{feature.name}</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              {totalTickets > 0
                ? `${progressSummary?.completedTickets ?? 0} of ${totalTickets} assigned ticket${
                    totalTickets === 1 ? "" : "s"
                  } complete`
                : "No assigned tickets contributing yet"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              <span>{feature._count.tickets} linked ticket{feature._count.tickets === 1 ? "" : "s"}</span>
              <span>{progress}% progress</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
