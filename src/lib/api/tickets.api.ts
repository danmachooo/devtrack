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
  GetProjectTicketsQuery,
  Ticket,
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

export async function getProjectTickets(
  projectId: string,
  query: GetProjectTicketsQuery = {},
): Promise<ApiResponse<Ticket[]>> {
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

    return {
      statusCode: 200,
      message: "Tickets have been found.",
      data: tickets.map(hydrateTicketFeature),
    };
  }

  const response = await api.get<ApiResponse<Ticket[]>>(`/projects/${projectId}/tickets`, {
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
