import type { ProjectFeatureSummary } from "@/types/api";

export type FeatureWorkspaceFilter = "all" | "empty" | "active" | "completed";

export type FeatureProgressSnapshot = {
  progress: number;
  totalTickets: number;
  completedTickets: number;
};

export type FeatureWorkspaceStatus = "empty" | "active" | "completed";

export function getFeatureWorkspaceStatus(progressSummary?: FeatureProgressSnapshot): FeatureWorkspaceStatus {
  if (!progressSummary || progressSummary.totalTickets === 0) {
    return "empty";
  }

  if (progressSummary.progress >= 100) {
    return "completed";
  }

  return "active";
}

export function matchesFeatureWorkspaceFilter(
  feature: ProjectFeatureSummary,
  filter: FeatureWorkspaceFilter,
  progressSummary?: FeatureProgressSnapshot,
) {
  if (filter === "all") {
    return true;
  }

  return getFeatureWorkspaceStatus(progressSummary) === filter;
}

export function filterFeaturesForWorkspace(
  features: ProjectFeatureSummary[],
  searchTerm: string,
  filter: FeatureWorkspaceFilter,
  progressByFeatureId: Map<string, FeatureProgressSnapshot>,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return features.filter((feature) => {
    if (normalizedSearch && !feature.name.toLowerCase().includes(normalizedSearch)) {
      return false;
    }

    return matchesFeatureWorkspaceFilter(feature, filter, progressByFeatureId.get(feature.id));
  });
}
