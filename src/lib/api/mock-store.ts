import type { Project, SessionData, SessionUser, SyncLog, Ticket } from "@/types/api";

const mockSessionStorageKey = "devtrack.mock.session";
const mockProjectStorageKey = "devtrack.mock.projects.store";
const mockTicketStorageKey = "devtrack.mock.tickets.store";
const mockSyncStorageKey = "devtrack.mock.sync.store";

export type MockProjectStore = {
  projects: Project[];
};

export type MockTicketStore = {
  tickets: Ticket[];
};

export type MockSyncStore = {
  activeJobs: Record<
    string,
    {
      jobId: string;
      queuedAt: string;
      expiresAt: number;
    }
  >;
  logsByProject: Record<string, SyncLog[]>;
};

export type ActiveMockSession = {
  session: NonNullable<SessionData["session"]>;
  user: SessionUser;
};

export function getEmptyProjectStore(): MockProjectStore {
  return { projects: [] };
}

export function getEmptyTicketStore(): MockTicketStore {
  return { tickets: [] };
}

export function getEmptySyncStore(): MockSyncStore {
  return { activeJobs: {}, logsByProject: {} };
}

export function readMockSession(): SessionData {
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

export function getCurrentSessionOrThrow(): ActiveMockSession {
  const sessionData = readMockSession();

  if (!sessionData.session || !sessionData.user) {
    throw new Error("Not authenticated.");
  }

  return {
    session: sessionData.session,
    user: sessionData.user,
  };
}

export function readProjectStore(): MockProjectStore {
  if (typeof window === "undefined") {
    return getEmptyProjectStore();
  }

  const raw = window.localStorage.getItem(mockProjectStorageKey);

  if (!raw) {
    return getEmptyProjectStore();
  }

  const parsed = JSON.parse(raw) as Partial<MockProjectStore>;

  return {
    projects: Array.isArray(parsed.projects) ? parsed.projects : [],
  };
}

export function writeProjectStore(store: MockProjectStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockProjectStorageKey, JSON.stringify(store));
}

export function readTicketStore(): MockTicketStore {
  if (typeof window === "undefined") {
    return getEmptyTicketStore();
  }

  const raw = window.localStorage.getItem(mockTicketStorageKey);

  if (!raw) {
    return getEmptyTicketStore();
  }

  const parsed = JSON.parse(raw) as Partial<MockTicketStore>;

  return {
    tickets: Array.isArray(parsed.tickets) ? parsed.tickets : [],
  };
}

export function writeTicketStore(store: MockTicketStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockTicketStorageKey, JSON.stringify(store));
}

export function readSyncStore(): MockSyncStore {
  if (typeof window === "undefined") {
    return getEmptySyncStore();
  }

  const raw = window.localStorage.getItem(mockSyncStorageKey);

  if (!raw) {
    return getEmptySyncStore();
  }

  const parsed = JSON.parse(raw) as Partial<MockSyncStore>;

  return {
    activeJobs: parsed.activeJobs ?? {},
    logsByProject: parsed.logsByProject ?? {},
  };
}

export function writeSyncStore(store: MockSyncStore) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(mockSyncStorageKey, JSON.stringify(store));
}

export function getScopedProjectOrThrow(projectId: string, organizationId: string) {
  const store = readProjectStore();
  const project = store.projects.find(
    (item) => item.id === projectId && item.organizationId === organizationId,
  );

  if (!project) {
    throw new Error("Project not found.");
  }

  return { project, store };
}

export function getFeatureById(project: Project, featureId: string) {
  return project.features.find((feature) => feature.id === featureId) ?? null;
}

export function getProjectTickets(projectId: string) {
  return readTicketStore().tickets.filter((ticket) => ticket.projectId === projectId);
}

export function decorateProjectWithDerivedCounts(project: Project) {
  const ticketCount = getProjectTickets(project.id).length;

  return {
    ...project,
    _count: {
      tickets: ticketCount,
    },
  };
}
