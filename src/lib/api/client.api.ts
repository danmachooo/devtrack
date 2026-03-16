import api from "@/lib/axios";
import {
  getCurrentSessionOrThrow,
  getScopedProjectOrThrow,
} from "@/lib/api/mock-store";
import { appConfig } from "@/lib/config/app";
import type { ApiResponse, ProjectClientAccessData } from "@/types/api";

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
