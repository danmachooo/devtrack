import { CheckSquare, FolderTree, MinusCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ProjectFeatureSummary } from "@/types/api";

type BulkTicketActionsProps = {
  features: ProjectFeatureSummary[];
  selectedCount: number;
  allVisibleSelected: boolean;
  isSubmitting: boolean;
  onToggleSelectAllVisible: (checked: boolean) => void;
  onBulkAssign: (featureId: string | null) => void;
  onClearSelection: () => void;
};

export function BulkTicketActions({
  features,
  selectedCount,
  allVisibleSelected,
  isSubmitting,
  onToggleSelectAllVisible,
  onBulkAssign,
  onClearSelection,
}: BulkTicketActionsProps) {
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--primary)_22%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_10%,var(--surface))_0%,color-mix(in_srgb,var(--surface)_94%,var(--background))_100%)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            <CheckSquare className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={2} />
            Bulk assignment
          </p>
          <p className="text-base font-semibold">{selectedCount} ticket{selectedCount === 1 ? "" : "s"} selected</p>
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">
            Assign the visible selection in one step, or clear it and keep reviewing row by row.
          </p>
        </div>

        <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] shadow-[var(--shadow-sm)]">
          <input
            checked={allVisibleSelected}
            className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
            onChange={(event) => onToggleSelectAllVisible(event.target.checked)}
            type="checkbox"
          />
          Select all visible
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end">
        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <label className="mb-2 flex items-center gap-2 text-sm font-medium" htmlFor="bulk-feature-select">
            <FolderTree className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
            Bulk feature assignment
          </label>
          <Select
            defaultValue=""
            disabled={isSubmitting}
            id="bulk-feature-select"
            onChange={(event) => {
              if (!event.target.value) {
                return;
              }

              onBulkAssign(event.target.value);
              event.target.value = "";
            }}
          >
            <option value="">Choose a feature</option>
            {features.map((feature) => (
              <option key={feature.id} value={feature.id}>
                {feature.name}
              </option>
            ))}
          </Select>
        </div>

        <Button
          className="min-w-40"
          disabled={isSubmitting}
          onClick={() => onBulkAssign(null)}
          type="button"
          variant="secondary"
        >
          <MinusCircle className="h-4 w-4" strokeWidth={2} />
          {isSubmitting ? "Updating..." : "Bulk unassign"}
        </Button>

        <Button disabled={isSubmitting} onClick={onClearSelection} type="button" variant="ghost">
          <X className="h-4 w-4" strokeWidth={2} />
          Clear selection
        </Button>
      </div>
    </div>
  );
}
