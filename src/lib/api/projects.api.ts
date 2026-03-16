import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  CreateProjectPayload,
  Project,
  SessionData,
  SessionUser,
  UpdateProjectPayload,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSessionStorageKey = "devtrack.mock.session";
const mockProjectStorageKey = "devtrack.mock.projects.store";

type MockProjectStore = {
  projects: Project[];
};

type ActiveMockSession = {
  session: NonNullable<SessionData["session"]>;
  user: SessionUser;
};

function getEmptyStore(): MockProjectStore {
  return {
    projects: [],
  };
}

function readMockStore(): MockProjectStore {
  if (typeof window === "undefined") {
    return getEmptyStore();
  }

  const raw = window.localStorage.getItem(mockProjectStorageKey);
  return raw ? (JSON.parse(raw) as MockProjectStore) : getEmptyStore();
}

function writeMockStore(store: MockProjectStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockProjectStorageKey, JSON.stringify(store));
}

function readMockSession(): SessionData {
  if (typeof window === "undefined") {
    return {
      session: null,
      user: null,
    };
  }

  const storedSession = window.localStorage.getItem(mockSessionStorageKey);
  const storedUser = window.localStorage.getItem(mockSessionStorageKey.replace("session", "user"));

  return {
    session: storedSession ? JSON.parse(storedSession) : null,
    user: storedUser ? (JSON.parse(storedUser) as SessionUser) : null,
  };
}

function getCurrentSessionOrThrow(): ActiveMockSession {
  const sessionData = readMockSession();

  if (!sessionData.session || !sessionData.user) {
    throw new Error("Not authenticated.");
  }

  return {
    session: sessionData.session,
    user: sessionData.user,
  };
}

function ensureTeamLeader(user: SessionUser) {
  if (user.role !== "TEAM_LEADER") {
    throw new Error("Only team leaders can create projects.");
  }
}

function getScopedProjectOrThrow(store: MockProjectStore, projectId: string, organizationId: string) {
  const project = store.projects.find(
    (item) => item.id === projectId && item.organizationId === organizationId,
  );

  if (!project) {
    throw new Error("Project not found.");
  }

  return project;
}

export async function getProjects(): Promise<ApiResponse<Project[]>> {
  if (appConfig.useMockApi) {
    await delay(240);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readMockStore();

    return {
      statusCode: 200,
      message: "Projects has been found.",
      data: store.projects.filter(
        (project) => project.organizationId === sessionData.session.activeOrganizationId,
      ),
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

    const store = readMockStore();
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
    writeMockStore(store);

    return {
      statusCode: 201,
      message: "Project has been created.",
      data: project,
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

    const store = readMockStore();
    const project = getScopedProjectOrThrow(store, id, sessionData.session.activeOrganizationId);

    return {
      statusCode: 200,
      message: `Project #${id} has been found.`,
      data: project,
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

    const store = readMockStore();
    const project = getScopedProjectOrThrow(store, id, sessionData.session.activeOrganizationId);

    project.name = payload.name ?? project.name;
    project.clientName = payload.clientName ?? project.clientName;
    project.clientEmail = payload.clientEmail ?? project.clientEmail;
    project.syncInterval = payload.syncInterval ?? project.syncInterval;
    project.updatedAt = new Date().toISOString();

    writeMockStore(store);

    return {
      statusCode: 200,
      message: "Project has been updated.",
      data: project,
    };
  }

  const response = await api.patch<ApiResponse<Project>>(`/projects/${id}`, payload);
  return response.data;
}
