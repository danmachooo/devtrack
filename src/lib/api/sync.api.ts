import api from "@/lib/axios";
import {
  getCurrentSessionOrThrow,
  getScopedProjectOrThrow,
  readSyncStore,
  readTicketStore,
  writeProjectStore,
  writeSyncStore,
  writeTicketStore,
} from "@/lib/api/mock-store";
import { appConfig } from "@/lib/config/app";
import type { ApiResponse, DevtrackStatus, SyncLog, SyncProjectData, Ticket } from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
function ensureSyncRole(user: { role: string }) {
  if (!["TEAM_LEADER", "BUSINESS_ANALYST"].includes(user.role)) {
    throw new Error("Only team leaders and business analysts can trigger a sync.");
  }
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
    const ticketStore = readTicketStore();
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
    const syncCounts = seedOrRefreshTickets(
      ticketStore.tickets,
      projectId,
      project.lastSyncedAt,
      project.statusMapping,
    );
    syncStore.logsByProject[projectId] = [
      createSyncLog(syncCounts, project.lastSyncedAt),
      ...(syncStore.logsByProject[projectId] ?? []),
    ].slice(0, 20);
    writeProjectStore(store);
    writeTicketStore(ticketStore);
    writeSyncStore(syncStore);

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

export async function getProjectSyncLogs(
  projectId: string,
  limit = 10,
): Promise<ApiResponse<SyncLog[]>> {
  if (appConfig.useMockApi) {
    await delay(160);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);
    const syncStore = readSyncStore();

    return {
      statusCode: 200,
      message: "Sync logs have been found.",
      data: (syncStore.logsByProject[projectId] ?? []).slice(0, Math.min(Math.max(limit, 1), 50)),
    };
  }

  const response = await api.get<ApiResponse<SyncLog[]>>(`/projects/${projectId}/sync/logs`, {
    params: { limit },
  });
  return response.data;
}

function seedOrRefreshTickets(
  tickets: Ticket[],
  projectId: string,
  syncedAt: string,
  statusMapping: Record<string, DevtrackStatus>,
) {
  const projectTickets = tickets.filter((ticket) => ticket.projectId === projectId);

  if (projectTickets.length) {
    for (const ticket of projectTickets) {
      ticket.syncedAt = syncedAt;
      ticket.updatedAt = syncedAt;
    }

    return {
      ticketsAdded: 0,
      ticketsUpdated: projectTickets.length,
    };
  }

  const mappingEntries = Object.entries(statusMapping);
  const fallbackStatuses: Array<[string, DevtrackStatus]> = [
    ["Backlog", "NOT_STARTED"],
    ["In Progress", "IN_DEV"],
    ["In QA", "APPROVED"],
    ["Done", "RELEASED"],
  ];
  const statusPairs = mappingEntries.length ? mappingEntries : fallbackStatuses;
  const assignees = ["Jane Doe", "Alex Cruz", "Priya Singh", "Miguel Santos", null];
  const titles = [
    "Build client dashboard shell",
    "Connect ticket sync diagnostics",
    "Refine onboarding flow",
    "Ship feature progress bars",
    "Add project command center summary",
    "Polish client-safe activity feed",
    "Create stakeholder-ready feature grouping",
    "Improve status mapping prompts",
    "Add manual sync trust state",
    "Review mobile dashboard spacing",
    "Tighten ticket assignment UX",
    "Confirm release checklist messaging",
  ];

  titles.forEach((title, index) => {
    const [notionStatus, devtrackStatus] = statusPairs[index % statusPairs.length];
    const createdAt = new Date(new Date(syncedAt).getTime() - (titles.length - index) * 60_000).toISOString();
    const isMissingFromSource = index === titles.length - 1;

    tickets.push({
      id: crypto.randomUUID(),
      projectId,
      featureId: null,
      notionPageId: crypto.randomUUID(),
      title,
      notionStatus,
      devtrackStatus,
      assigneeName: assignees[index % assignees.length],
      isMissingFromSource,
      missingFromSourceAt: isMissingFromSource ? syncedAt : null,
      syncedAt,
      createdAt,
      updatedAt: syncedAt,
      feature: null,
    });
  });

  return {
    ticketsAdded: titles.length,
    ticketsUpdated: 0,
  };
}

function createSyncLog(
  counts: { ticketsAdded: number; ticketsUpdated: number },
  createdAt: string,
): SyncLog {
  return {
    id: crypto.randomUUID(),
    status: "SUCCESS",
    ticketsAdded: counts.ticketsAdded,
    ticketsUpdated: counts.ticketsUpdated,
    errorMessage: null,
    createdAt,
  };
}
