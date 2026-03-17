import api from "@/lib/axios";
import {
  getCurrentSessionOrThrow,
  getFeatureById,
  getScopedProjectOrThrow,
  readProjectStore,
  readTicketStore,
  writeTicketStore,
} from "@/lib/api/mock-store";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  BulkUpdateTicketFeatureData,
  BulkUpdateTicketFeaturePayload,
  GetProjectTicketsQuery,
  PaginatedResultMeta,
  SortOrder,
  Ticket,
  TicketListData,
  TicketSortBy,
  UpdateTicketFeaturePayload,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureTicketAssignmentRole(user: { role: string }) {
  if (!["TEAM_LEADER", "BUSINESS_ANALYST"].includes(user.role)) {
    throw new Error("Only team leaders and business analysts can assign tickets.");
  }
}

function hydrateTicketFeature(ticket: Ticket) {
  if (!ticket.featureId) {
    return {
      ...ticket,
      feature: null,
    };
  }

  const store = readProjectStore();
  const project = store.projects.find((item) => item.id === ticket.projectId);
  const feature = project ? getFeatureById(project, ticket.featureId) : null;

  return {
    ...ticket,
    feature: feature
      ? {
          id: feature.id,
          name: feature.name,
          order: feature.order,
        }
      : null,
  };
}

function normalizePaginationValue(value: number | undefined, fallback: number, min: number, max: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(value as number), min), max);
}

function sortTickets(tickets: Ticket[], sortBy: TicketSortBy, sortOrder: SortOrder) {
  const direction = sortOrder === "asc" ? 1 : -1;

  return [...tickets].sort((left, right) => {
    const leftValue =
      sortBy === "title" || sortBy === "devtrackStatus"
        ? String(left[sortBy]).toLowerCase()
        : new Date(left[sortBy]).getTime();
    const rightValue =
      sortBy === "title" || sortBy === "devtrackStatus"
        ? String(right[sortBy]).toLowerCase()
        : new Date(right[sortBy]).getTime();

    if (leftValue < rightValue) {
      return -1 * direction;
    }

    if (leftValue > rightValue) {
      return 1 * direction;
    }

    return 0;
  });
}

function buildTicketListData(
  tickets: Ticket[],
  query: GetProjectTicketsQuery = {},
): ApiResponse<TicketListData> {
  const page = normalizePaginationValue(query.page, 1, 1, Number.MAX_SAFE_INTEGER);
  const limit = normalizePaginationValue(query.limit, 20, 1, 100);
  const sortBy = query.sortBy ?? "syncedAt";
  const sortOrder = query.sortOrder ?? "desc";
  const search = query.search?.trim() || null;
  const assignee = query.assignee?.trim() || null;
  const totalItems = tickets.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / limit);
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * limit;
  const items = sortTickets(tickets, sortBy, sortOrder)
    .slice(startIndex, startIndex + limit)
    .map(hydrateTicketFeature);
  const pagination: PaginatedResultMeta = {
    page: safePage,
    limit,
    totalItems,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };

  return {
    statusCode: 200,
    message: "Tickets have been found.",
    data: {
      items,
      pagination,
      search,
      assignee,
      sort: {
        by: sortBy,
        order: sortOrder,
      },
    },
  };
}

export async function getProjectTickets(
  projectId: string,
  query: GetProjectTicketsQuery = {},
): Promise<ApiResponse<TicketListData>> {
  if (appConfig.useMockApi) {
    await delay(180);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);

    if (query.featureId && query.unassigned) {
      throw new Error("Feature and unassigned filters cannot be combined.");
    }

    let tickets = readTicketStore().tickets.filter((ticket) => ticket.projectId === projectId);

    if (query.featureId) {
      tickets = tickets.filter((ticket) => ticket.featureId === query.featureId);
    }

    if (query.status) {
      tickets = tickets.filter((ticket) => ticket.devtrackStatus === query.status);
    }

    if (query.unassigned) {
      tickets = tickets.filter((ticket) => ticket.featureId === null);
    }

    if (!query.showMissing) {
      tickets = tickets.filter((ticket) => !ticket.isMissingFromSource);
    }

    if (query.search?.trim()) {
      const search = query.search.trim().toLowerCase();
      tickets = tickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(search) ||
          (ticket.assigneeName ?? "").toLowerCase().includes(search),
      );
    }

    if (query.assignee?.trim()) {
      const assignee = query.assignee.trim().toLowerCase();
      tickets = tickets.filter((ticket) => (ticket.assigneeName ?? "").toLowerCase().includes(assignee));
    }

    return buildTicketListData(tickets, query);
  }

  const response = await api.get<ApiResponse<TicketListData>>(`/projects/${projectId}/tickets`, {
    params: query,
  });
  return response.data;
}

export async function updateTicketFeature(
  ticketId: string,
  payload: UpdateTicketFeaturePayload,
): Promise<ApiResponse<Ticket>> {
  if (appConfig.useMockApi) {
    await delay(180);

    const sessionData = getCurrentSessionOrThrow();
    ensureTicketAssignmentRole(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readProjectStore();
    const ticketStore = readTicketStore();
    const ticket = ticketStore.tickets.find((item) => item.id === ticketId);

    if (!ticket) {
      throw new Error("Ticket not found.");
    }

    const project = store.projects.find(
      (item) =>
        item.id === ticket.projectId && item.organizationId === sessionData.session.activeOrganizationId,
    );

    if (!project) {
      throw new Error("Ticket not found.");
    }

    const feature = payload.featureId ? getFeatureById(project, payload.featureId) : null;

    if (payload.featureId && !feature) {
      throw new Error("Feature not found for this project.");
    }

    ticket.featureId = feature?.id ?? null;
    ticket.feature = feature
      ? {
          id: feature.id,
          name: feature.name,
          order: feature.order,
        }
      : null;
    ticket.updatedAt = new Date().toISOString();

    writeTicketStore(ticketStore);

    return {
      statusCode: 200,
      message: "Ticket feature has been updated.",
      data: hydrateTicketFeature(ticket),
    };
  }

  const response = await api.patch<ApiResponse<Ticket>>(`/tickets/${ticketId}/feature`, payload);
  return response.data;
}

export async function bulkUpdateTicketFeature(
  payload: BulkUpdateTicketFeaturePayload,
): Promise<ApiResponse<BulkUpdateTicketFeatureData>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureTicketAssignmentRole(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readProjectStore();
    const ticketStore = readTicketStore();
    const selectedTickets = ticketStore.tickets.filter((ticket) => payload.ticketIds.includes(ticket.id));

    if (!selectedTickets.length) {
      throw new Error("No tickets found for bulk assignment.");
    }

    const projectId = selectedTickets[0].projectId;
    const allSameProject = selectedTickets.every((ticket) => ticket.projectId === projectId);

    if (!allSameProject || selectedTickets.length !== payload.ticketIds.length) {
      throw new Error("All selected tickets must belong to the same project.");
    }

    const project = store.projects.find(
      (item) => item.id === projectId && item.organizationId === sessionData.session.activeOrganizationId,
    );

    if (!project) {
      throw new Error("Project not found.");
    }

    const feature = payload.featureId ? getFeatureById(project, payload.featureId) : null;

    if (payload.featureId && !feature) {
      throw new Error("Feature not found for this project.");
    }

    const now = new Date().toISOString();
    const updatedById = new Map<string, Ticket>();

    ticketStore.tickets = ticketStore.tickets.map((ticket) => {
      if (!payload.ticketIds.includes(ticket.id)) {
        return ticket;
      }

      const updatedTicket = {
        ...ticket,
        featureId: feature?.id ?? null,
        feature: feature
          ? {
              id: feature.id,
              name: feature.name,
              order: feature.order,
            }
          : null,
        updatedAt: now,
      };

      updatedById.set(ticket.id, updatedTicket);
      return updatedTicket;
    });

    writeTicketStore(ticketStore);

    return {
      statusCode: 200,
      message: "Ticket features have been updated.",
      data: {
        totalUpdated: updatedById.size,
        projectId,
        featureId: feature?.id ?? null,
        tickets: payload.ticketIds
          .map((ticketId) => updatedById.get(ticketId))
          .filter((ticket): ticket is Ticket => Boolean(ticket))
          .map(hydrateTicketFeature),
      },
    };
  }

  const response = await api.patch<ApiResponse<BulkUpdateTicketFeatureData>>(
    "/tickets/feature/bulk",
    payload,
  );
  return response.data;
}
