"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjectSyncLogs } from "@/lib/api/sync.api";
import type { FeatureProgressSummary, Project } from "@/types/api";

export function useProjectProgress(project: Project) {
  const featureProgress = mapFeatureProgressSummaries(project);

  const syncLogsQuery = useQuery({
    queryKey: ["project", project.id, "sync-logs"],
    queryFn: () => getProjectSyncLogs(project.id, 10),
  });

  return {
    syncLogsQuery,
    featureProgress,
    aggregateProgress: project.progressSummary?.overallProgress ?? 0,
    syncLogs: syncLogsQuery.data?.data ?? [],
  };
}

function mapFeatureProgressSummaries(project: Project): FeatureProgressSummary[] {
  return [...(project.progressSummary?.featureSummaries ?? [])]
    .sort((left, right) => left.order - right.order)
    .map((feature) => ({
      featureId: feature.featureId,
      featureName: feature.name,
      order: feature.order,
      progress: feature.progress,
      status: feature.status,
      totalTickets: feature.totalTickets,
      completedTickets: feature.completedTickets,
    }));
}
