"use client";

import { useQueries } from "@tanstack/react-query";

import { buildFeatureProgressSummaries, getAggregateProjectProgress } from "@/features/progress/progress-utils";
import { getProjectTickets } from "@/lib/api/tickets.api";
import type { Project, ProjectFeatureSummary } from "@/types/api";

function toFeatureSummaries(project: Project): ProjectFeatureSummary[] {
  return project.features.map((feature) => ({
    ...feature,
    _count: {
      tickets: 0,
    },
  }));
}

export function useProjectListProgress(projects: Project[]) {
  const progressQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["project", project.id, "tickets", { showMissing: true }, "list-progress"],
      queryFn: () => getProjectTickets(project.id, { showMissing: true }),
      enabled: Boolean(project.lastSyncedAt && project.features.length && project._count.tickets > 0),
      staleTime: 60_000,
    })),
  });

  const progressByProjectId = new Map<string, number>();

  projects.forEach((project, index) => {
    const query = progressQueries[index];

    if (!project.lastSyncedAt || !project.features.length || project._count.tickets === 0) {
      progressByProjectId.set(project.id, 0);
      return;
    }

    const tickets = query.data?.data;
    if (!tickets) {
      progressByProjectId.set(project.id, 0);
      return;
    }

    const featureProgress = buildFeatureProgressSummaries(toFeatureSummaries(project), tickets);
    progressByProjectId.set(project.id, getAggregateProjectProgress(featureProgress));
  });

  return {
    progressByProjectId,
    progressQueries,
  };
}
