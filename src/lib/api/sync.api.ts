import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import type { ApiResponse, Project, SessionData, SessionUser, SyncProjectData } from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockSessionStorageKey = "devtrack.mock.session";
const mockProjectStorageKey = "devtrack.mock.projects.store";
const mockSyncStorageKey = "devtrack.mock.sync.store";

type MockProjectStore = {
  projects: Project[];
};

type MockSyncStore = {
  activeJobs: Record<
    string,
    {
      jobId: string;
      queuedAt: string;
      expiresAt: number;
    }
  >;
};

type ActiveMockSession = {
  session: NonNullable<SessionData["session"]>;
  user: SessionUser;
};

function getEmptyProjectStore(): MockProjectStore {
  return { projects: [] };
}

function getEmptySyncStore(): MockSyncStore {
  return { activeJobs: {} };
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

function readSyncStore(): MockSyncStore {
  if (typeof window === "undefined") {
    return getEmptySyncStore();
  }

  const raw = window.localStorage.getItem(mockSyncStorageKey);
  return raw ? (JSON.parse(raw) as MockSyncStore) : getEmptySyncStore();
}

function writeSyncStore(store: MockSyncStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockSyncStorageKey, JSON.stringify(store));
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

function ensureSyncRole(user: SessionUser) {
  if (!["TEAM_LEADER", "BUSINESS_ANALYST"].includes(user.role)) {
    throw new Error("Only team leaders and business analysts can trigger a sync.");
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

export async function triggerProjectSync(projectId: string): Promise<ApiResponse<SyncProjectData>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureSyncRole(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project, store } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);

    if (!project.notionDatabaseId) {
      throw new Error("Notion must be connected before syncing.");
    }

    if (!project.statusMapping || Object.keys(project.statusMapping).length === 0) {
      throw new Error("Status mapping must be saved before syncing.");
    }

    const syncStore = readSyncStore();
    const now = Date.now();
    const existingJob = syncStore.activeJobs[projectId];

    if (existingJob && existingJob.expiresAt > now) {
      return {
        statusCode: 200,
        message: "Project sync already scheduled.",
        data: {
          projectId,
          alreadyQueued: true,
          jobId: existingJob.jobId,
        },
      };
    }

    const jobId = `manual-project-sync-${projectId}`;
    syncStore.activeJobs[projectId] = {
      jobId,
      queuedAt: new Date(now).toISOString(),
      expiresAt: now + 4_000,
    };

    project.lastSyncedAt = new Date(now).toISOString();
    project.updatedAt = new Date(now).toISOString();
    project._count.tickets = Math.max(project._count.tickets, 12);

    writeSyncStore(syncStore);
    writeProjectStore(store);

    return {
      statusCode: 202,
      message: "Project sync scheduled successfully.",
      data: {
        projectId,
        alreadyQueued: false,
        jobId,
      },
    };
  }

  const response = await api.post<ApiResponse<SyncProjectData>>(`/projects/${projectId}/notion/sync`);
  return response.data;
}
