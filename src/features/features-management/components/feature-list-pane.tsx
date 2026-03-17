import { Filter, Layers3, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FeatureListRow } from "@/features/features-management/components/feature-list-row";
import type {
  FeatureProgressSnapshot,
  FeatureWorkspaceFilter,
} from "@/features/features-management/feature-management.utils";
import type { ProjectFeatureSummary } from "@/types/api";

const filterOptions: Array<{ value: FeatureWorkspaceFilter; label: string }> = [
  { value: "all", label: "All features" },
  { value: "empty", label: "No assigned work" },
  { value: "active", label: "Active work" },
  { value: "completed", label: "Completed" },
];

type FeatureListPaneProps = {
  features: ProjectFeatureSummary[];
  totalFeatureCount: number;
  selectedFeatureId: string | null;
  searchTerm: string;
  activeFilter: FeatureWorkspaceFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: FeatureWorkspaceFilter) => void;
  onSelectFeature: (featureId: string) => void;
  progressByFeatureId: Map<string, FeatureProgressSnapshot>;
};

export function FeatureListPane({
  features,
  totalFeatureCount,
  selectedFeatureId,
  searchTerm,
  activeFilter,
  onSearchChange,
  onFilterChange,
  onSelectFeature,
  progressByFeatureId,
}: FeatureListPaneProps) {
  return (
    <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,color-mix(in_srgb,var(--background)_92%,var(--surface))_100%)] p-5 shadow-[var(--shadow-sm)]">
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          <Layers3 className="h-3.5 w-3.5" strokeWidth={2} />
          Feature list
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold tracking-tight">Keep the client story ordered</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Select a feature to edit its name, order, and destructive actions without cluttering every row.
            </p>
          </div>
          <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
            {features.length} shown / {totalFeatureCount} total
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="feature-search">
            <Search className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
            Search features
          </label>
          <Input
            id="feature-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search feature names"
            value={searchTerm}
          />
        </div>

        <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <label className="flex items-center gap-2 text-sm font-medium" htmlFor="feature-filter">
            <Filter className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
            Filter
          </label>
          <Select
            id="feature-filter"
            onChange={(event) => onFilterChange(event.target.value as FeatureWorkspaceFilter)}
            value={activeFilter}
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
        {features.map((feature) => (
          <FeatureListRow
            key={feature.id}
            feature={feature}
            isSelected={selectedFeatureId === feature.id}
            onSelect={() => onSelectFeature(feature.id)}
            progressSummary={progressByFeatureId.get(feature.id)}
          />
        ))}
      </div>
    </div>
  );
}
