"use client";

import { useQuery } from "@tanstack/react-query";

import { getProjectFeatures } from "@/lib/api/features.api";
import { getProjectSyncLogs } from "@/lib/api/sync.api";
import { getProjectTickets } from "@/lib/api/tickets.api";
import {
  buildFeatureProgressSummaries,
  getAggregateProjectProgress,
} from "@/features/progress/progress-utils";

export function useProjectProgress(projectId: string) {
  const featuresQuery = useQuery({
    queryKey: ["project", projectId, "features"],
    queryFn: () => getProjectFeatures(projectId),
  });

  const ticketsQuery = useQuery({
    queryKey: ["project", projectId, "tickets", { showMissing: true }],
    queryFn: () => getProjectTickets(projectId, { showMissing: true }),
  });

  const syncLogsQuery = useQuery({
    queryKey: ["project", projectId, "sync-logs"],
    queryFn: () => getProjectSyncLogs(projectId, 10),
  });

  const featureProgress = buildFeatureProgressSummaries(
    featuresQuery.data?.data ?? [],
    ticketsQuery.data?.data ?? [],
  );

  return {
    featuresQuery,
    ticketsQuery,
    syncLogsQuery,
    featureProgress,
    aggregateProgress: getAggregateProjectProgress(featureProgress),
    syncLogs: syncLogsQuery.data?.data ?? [],
  };
}
