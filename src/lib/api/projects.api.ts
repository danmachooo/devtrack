import api from "@/lib/axios";
import {
  decorateProjectWithDerivedCounts,
  getCurrentSessionOrThrow,
  getScopedProjectOrThrow,
  readProjectStore,
  writeProjectStore,
} from "@/lib/api/mock-store";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  CreateProjectPayload,
  Project,
  UpdateProjectPayload,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureTeamLeader(user: { role: string }) {
  if (user.role !== "TEAM_LEADER") {
    throw new Error("Only team leaders can create projects.");
  }
}

export async function getProjects(): Promise<ApiResponse<Project[]>> {
  if (appConfig.useMockApi) {
    await delay(240);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readProjectStore();

    return {
      statusCode: 200,
      message: "Projects has been found.",
      data: store.projects
        .filter((project) => project.organizationId === sessionData.session.activeOrganizationId)
        .map(decorateProjectWithDerivedCounts),
    };
  }

  const response = await api.get<ApiResponse<Project[]>>("/projects");
  return response.data;
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<ApiResponse<Project>> {
  if (appConfig.useMockApi) {
    await delay(300);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readProjectStore();
    const now = new Date().toISOString();
    const projectId = crypto.randomUUID();

    const project: Project = {
      id: projectId,
      name: payload.name,
      clientName: payload.clientName,
      clientEmail: payload.clientEmail,
      notionDatabaseId: null,
      statusMapping: null,
      syncInterval: null,
      lastSyncedAt: null,
      organizationId: sessionData.session.activeOrganizationId,
      createdById: sessionData.user.id,
      createdAt: now,
      updatedAt: now,
      clientAccess: {
        id: crypto.randomUUID(),
        projectId,
        lastViewedAt: null,
        createdAt: now,
      },
      features: [],
      _count: {
        tickets: 0,
      },
    };

    store.projects.unshift(project);
    writeProjectStore(store);

    return {
      statusCode: 201,
      message: "Project has been created.",
      data: decorateProjectWithDerivedCounts(project),
    };
  }

  const response = await api.post<ApiResponse<Project>>("/projects", payload);
  return response.data;
}

export async function getProject(id: string): Promise<ApiResponse<Project>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project } = getScopedProjectOrThrow(id, sessionData.session.activeOrganizationId);

    return {
      statusCode: 200,
      message: `Project #${id} has been found.`,
      data: decorateProjectWithDerivedCounts(project),
    };
  }

  const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
  return response.data;
}

export async function updateProject(
  id: string,
  payload: UpdateProjectPayload,
): Promise<ApiResponse<Project>> {
  if (appConfig.useMockApi) {
    await delay(260);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project, store } = getScopedProjectOrThrow(id, sessionData.session.activeOrganizationId);

    project.name = payload.name ?? project.name;
    project.clientName = payload.clientName ?? project.clientName;
    project.clientEmail = payload.clientEmail ?? project.clientEmail;
    project.syncInterval = payload.syncInterval ?? project.syncInterval;
    project.updatedAt = new Date().toISOString();

    writeProjectStore(store);

    return {
      statusCode: 200,
      message: "Project has been updated.",
      data: decorateProjectWithDerivedCounts(project),
    };
  }

  const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
  return response.data;
}
