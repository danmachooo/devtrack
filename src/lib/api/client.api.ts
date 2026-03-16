import api from "@/lib/axios";
import {
  decorateProjectWithDerivedCounts,
  getCurrentSessionOrThrow,
  readProjectStore,
  readSyncStore,
  readTicketStore,
  getScopedProjectOrThrow,
  writeProjectStore,
} from "@/lib/api/mock-store";
import { appConfig } from "@/lib/config/app";
import { buildFeatureProgressSummaries, getAggregateProjectProgress } from "@/features/progress/progress-utils";
import type {
  ApiResponse,
  ClientDashboardActivity,
  ClientDashboardData,
  ProjectClientAccessData,
  ProjectFeatureSummary,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureClientAccessRole(user: { role: string }) {
  if (!["TEAM_LEADER", "BUSINESS_ANALYST"].includes(user.role)) {
    throw new Error("Only team leaders and business analysts can view client access.");
  }
}

export async function getProjectClientAccess(
  projectId: string,
): Promise<ApiResponse<ProjectClientAccessData>> {
  if (appConfig.useMockApi) {
    await delay(160);

    const sessionData = getCurrentSessionOrThrow();
    ensureClientAccessRole(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);
    const origin = typeof window === "undefined" ? "http://localhost:3000" : window.location.origin;

    return {
      statusCode: 200,
      message: "Client access link has been found.",
      data: {
        projectId,
        clientAccessLink: `${origin}/client/${project.clientAccess.id}`,
        lastViewedAt: project.clientAccess.lastViewedAt,
      },
    };
  }

  const response = await api.get<ApiResponse<ProjectClientAccessData>>(
    `/projects/${projectId}/client-access`,
  );
  return response.data;
}

export async function getClientDashboard(
  token: string,
): Promise<ApiResponse<ClientDashboardData>> {
  if (appConfig.useMockApi) {
    await delay(180);

    const projectStore = readProjectStore();
    const ticketStore = readTicketStore();
    const syncStore = readSyncStore();
    const project = projectStore.projects.find((item) => item.clientAccess.id === token);

    if (!project) {
      throw new Error("This client link is invalid or no longer available.");
    }

    project.clientAccess.lastViewedAt = new Date().toISOString();
    writeProjectStore(projectStore);

    const decoratedProject = decorateProjectWithDerivedCounts(project);
    const projectTickets = ticketStore.tickets.filter((ticket) => ticket.projectId === project.id);
    const featureSummaries: ProjectFeatureSummary[] = decoratedProject.features.map((feature) => ({
      ...feature,
      _count: {
        tickets: projectTickets.filter((ticket) => ticket.featureId === feature.id).length,
      },
    }));
    const featureProgress = buildFeatureProgressSummaries(featureSummaries, projectTickets);
    const recentActivity: ClientDashboardActivity[] = (syncStore.logsByProject[project.id] ?? [])
      .slice(0, 5)
      .map((log) => ({
        status: log.status,
        message: getClientActivityMessage(log.status),
        ticketsAdded: log.ticketsAdded,
        ticketsUpdated: log.ticketsUpdated,
        happenedAt: log.createdAt,
      }));

    return {
      statusCode: 200,
      message: "Client dashboard has been found.",
      data: {
        projectName: decoratedProject.name,
        overallProgress: getAggregateProjectProgress(featureProgress),
        lastSyncedAt: decoratedProject.lastSyncedAt,
        features: featureProgress.map((feature) => ({
          name: feature.featureName,
          progress: feature.progress,
          status: feature.status,
          totalTickets: feature.totalTickets,
          completedTickets: feature.completedTickets,
        })),
        recentActivity,
      },
    };
  }

  const response = await api.get<ApiResponse<ClientDashboardData>>(`/client/${token}`);
  return response.data;
}

function getClientActivityMessage(status: ClientDashboardActivity["status"]) {
  switch (status) {
    case "SUCCESS":
      return "Project data was synced successfully.";
    case "FAILED":
      return "A sync attempt failed and the team is reviewing it.";
    case "RATE_LIMITED":
      return "A sync attempt was delayed by source rate limits.";
  }
}
