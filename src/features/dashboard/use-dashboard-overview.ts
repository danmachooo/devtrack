"use client";

import { useQuery } from "@tanstack/react-query";

import { useInternalSession } from "@/features/auth/internal-session-context";
import { buildDashboardMetrics, buildDashboardPriorities, buildDashboardProjectHealth } from "@/features/dashboard/dashboard.utils";
import { getProjects } from "@/lib/api/projects.api";

export function useDashboardOverview() {
  const sessionQuery = useInternalSession();
  const role = sessionQuery.data?.data.user?.role;
  const activeOrganizationId = sessionQuery.data?.data.session?.activeOrganizationId;

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    enabled: Boolean(activeOrganizationId),
    staleTime: 30_000,
  });

  const projects = projectsQuery.data?.data ?? [];

  return {
    role,
    sessionQuery,
    projectsQuery,
    projects,
    metrics: buildDashboardMetrics(projects),
    priorities: buildDashboardPriorities(projects, role),
    projectHealth: buildDashboardProjectHealth(projects),
  };
}
