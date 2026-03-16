import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  DevtrackStatus,
  NotionConnectionDetails,
  NotionConnectionPayload,
  Project,
  SaveStatusMappingPayload,
  SessionData,
  SessionUser,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSessionStorageKey = "devtrack.mock.session";
const mockProjectStorageKey = "devtrack.mock.projects.store";
const mockNotionStorageKey = "devtrack.mock.notion.store";

type MockProjectStore = {
  projects: Project[];
};

type MockNotionStore = {
  connections: Record<string, NotionConnectionDetails>;
};

type ActiveMockSession = {
  session: NonNullable<SessionData["session"]>;
  user: SessionUser;
};

function getEmptyProjectStore(): MockProjectStore {
  return { projects: [] };
}

function getEmptyNotionStore(): MockNotionStore {
  return { connections: {} };
}

function readMockSession(): SessionData {
  if (typeof window === "undefined") {
    return { session: null, user: null };
  }

  const storedSession = window.localStorage.getItem(mockSessionStorageKey);
  const storedUser = window.localStorage.getItem(mockSessionStorageKey.replace("session", "user"));

  return {
    session: storedSession ? JSON.parse(storedSession) : null,
    user: storedUser ? (JSON.parse(storedUser) as SessionUser) : null,
  };
}

function readProjectStore(): MockProjectStore {
  if (typeof window === "undefined") {
    return getEmptyProjectStore();
  }

  const raw = window.localStorage.getItem(mockProjectStorageKey);
  return raw ? (JSON.parse(raw) as MockProjectStore) : getEmptyProjectStore();
}

function writeProjectStore(store: MockProjectStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockProjectStorageKey, JSON.stringify(store));
}

function readNotionStore(): MockNotionStore {
  if (typeof window === "undefined") {
    return getEmptyNotionStore();
  }

  const raw = window.localStorage.getItem(mockNotionStorageKey);
  return raw ? (JSON.parse(raw) as MockNotionStore) : getEmptyNotionStore();
}

function writeNotionStore(store: MockNotionStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockNotionStorageKey, JSON.stringify(store));
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
    throw new Error("Only team leaders can manage Notion setup.");
  }
}

function getScopedProjectOrThrow(projectId: string, organizationId: string) {
  const store = readProjectStore();
  const project = store.projects.find(
    (item) => item.id === projectId && item.organizationId === organizationId,
  );

  if (!project) {
    throw new Error("Project not found.");
  }

  return { project, store };
}

function buildConnectionDetails(projectId: string, databaseId: string): NotionConnectionDetails {
  const shortId = databaseId.slice(0, 8);

  return {
    projectId,
    notionDatabaseId: databaseId,
    databaseTitle: `DevTrack Tickets ${shortId}`,
    databaseUrl: `https://www.notion.so/${databaseId.replace(/-/g, "")}`,
    dataSources: [
      {
        id: `source-${shortId}`,
        name: "DevTrack Tickets",
      },
    ],
  };
}

export async function testNotionConnection(
  projectId: string,
  payload: NotionConnectionPayload,
): Promise<ApiResponse<NotionConnectionDetails>> {
  if (appConfig.useMockApi) {
    await delay(300);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);

    return {
      statusCode: 200,
      message: "Notion connection has been verified.",
      data: buildConnectionDetails(projectId, payload.databaseId),
    };
  }

  const response = await api.post<ApiResponse<NotionConnectionDetails>>(
    `/projects/${projectId}/notion/test`,
    payload,
  );
  return response.data;
}

export async function connectNotion(
  projectId: string,
  payload: NotionConnectionPayload,
): Promise<ApiResponse<NotionConnectionDetails>> {
  if (appConfig.useMockApi) {
    await delay(320);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project, store } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);
    const notionStore = readNotionStore();
    const details = buildConnectionDetails(projectId, payload.databaseId);

    notionStore.connections[projectId] = details;
    project.notionDatabaseId = payload.databaseId;
    project.updatedAt = new Date().toISOString();

    writeNotionStore(notionStore);
    writeProjectStore(store);

    return {
      statusCode: 200,
      message: "Notion has been connected.",
      data: details,
    };
  }

  const response = await api.post<ApiResponse<NotionConnectionDetails>>(
    `/projects/${projectId}/notion/connect`,
    payload,
  );
  return response.data;
}

export async function getNotionDatabases(
  projectId: string,
): Promise<ApiResponse<NotionConnectionDetails[]>> {
  if (appConfig.useMockApi) {
    await delay(180);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);
    const notionStore = readNotionStore();
    const storedConnection = notionStore.connections[projectId];
    const fallbackConnection =
      project.notionDatabaseId ? buildConnectionDetails(projectId, project.notionDatabaseId) : null;

    return {
      statusCode: 200,
      message: "Notion databases have been found.",
      data: storedConnection ? [storedConnection] : fallbackConnection ? [fallbackConnection] : [],
    };
  }

  const response = await api.get<ApiResponse<NotionConnectionDetails[]>>(
    `/projects/${projectId}/notion/databases`,
  );
  return response.data;
}

export async function saveNotionStatusMapping(
  projectId: string,
  payload: SaveStatusMappingPayload,
): Promise<ApiResponse<{ projectId: string; statusMapping: Record<string, DevtrackStatus> }>> {
  if (appConfig.useMockApi) {
    await delay(240);

    const sessionData = getCurrentSessionOrThrow();
    ensureTeamLeader(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project, store } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);

    project.statusMapping = payload.statusMapping;
    project.updatedAt = new Date().toISOString();

    writeProjectStore(store);

    return {
      statusCode: 200,
      message: "Notion status mapping has been saved.",
      data: {
        projectId,
        statusMapping: payload.statusMapping,
      },
    };
  }

  const response = await api.post<
    ApiResponse<{ projectId: string; statusMapping: SaveStatusMappingPayload["statusMapping"] }>
  >(`/projects/${projectId}/notion/mapping`, payload);
  return response.data;
}
