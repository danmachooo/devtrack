"use client";

import { useQuery } from "@tanstack/react-query";

import { buildDashboardMetrics, buildDashboardPriorities, buildDashboardProjectHealth } from "@/features/dashboard/dashboard.utils";
import { useProjectListProgress } from "@/features/projects/use-project-list-progress";
import { useSession } from "@/hooks/use-session";
import { getProjects } from "@/lib/api/projects.api";

export function useDashboardOverview() {
  const sessionQuery = useSession();
  const role = sessionQuery.data?.data.user?.role;
  const activeOrganizationId = sessionQuery.data?.data.session?.activeOrganizationId;

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    enabled: Boolean(activeOrganizationId),
  });

  const projects = projectsQuery.data?.data ?? [];
  const { progressByProjectId } = useProjectListProgress(projects);

  return {
    role,
    sessionQuery,
    projectsQuery,
    projects,
    metrics: buildDashboardMetrics(projects),
    priorities: buildDashboardPriorities(projects, role),
    projectHealth: buildDashboardProjectHealth(projects, progressByProjectId),
  };
}
