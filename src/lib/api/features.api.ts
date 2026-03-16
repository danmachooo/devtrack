import api from "@/lib/axios";
import {
  getCurrentSessionOrThrow,
  getFeatureById,
  getProjectTickets,
  getScopedProjectOrThrow,
  readProjectStore,
  readTicketStore,
  writeProjectStore,
  writeTicketStore,
} from "@/lib/api/mock-store";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  CreateFeaturePayload,
  ProjectFeature,
  ProjectFeatureSummary,
  UpdateFeaturePayload,
} from "@/types/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function ensureFeatureManager(user: { role: string }) {
  if (!["TEAM_LEADER", "BUSINESS_ANALYST"].includes(user.role)) {
    throw new Error("Only team leaders and business analysts can manage features.");
  }
}

function normalizeFeatureOrder(features: ProjectFeature[]) {
  const sorted = [...features].sort((left, right) => left.order - right.order);

  return sorted.map((feature, index) => ({
    ...feature,
    order: index,
  }));
}

function toSummary(feature: ProjectFeature): ProjectFeatureSummary {
  return {
    ...feature,
    _count: {
      tickets: 0,
    },
  };
}

function toSummaryWithTicketCount(projectId: string, feature: ProjectFeature): ProjectFeatureSummary {
  const tickets = getProjectTickets(projectId).filter((ticket) => ticket.featureId === feature.id);

  return {
    ...toSummary(feature),
    _count: {
      tickets: tickets.length,
    },
  };
}

export async function getProjectFeatures(
  projectId: string,
): Promise<ApiResponse<ProjectFeatureSummary[]>> {
  if (appConfig.useMockApi) {
    await delay(180);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);

    return {
      statusCode: 200,
      message: "Features have been found.",
      data: normalizeFeatureOrder(project.features).map((feature) =>
        toSummaryWithTicketCount(projectId, feature),
      ),
    };
  }

  const response = await api.get<ApiResponse<ProjectFeatureSummary[]>>(`/projects/${projectId}/features`);
  return response.data;
}

export async function createFeature(
  projectId: string,
  payload: CreateFeaturePayload,
): Promise<ApiResponse<ProjectFeatureSummary>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureFeatureManager(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const { project, store } = getScopedProjectOrThrow(projectId, sessionData.session.activeOrganizationId);
    const now = new Date().toISOString();
    const nextOrder =
      payload.order ?? (project.features.length ? Math.max(...project.features.map((item) => item.order)) + 1 : 0);

    const feature: ProjectFeature = {
      id: crypto.randomUUID(),
      name: payload.name,
      order: nextOrder,
      projectId,
      createdAt: now,
      updatedAt: now,
    };

    project.features = normalizeFeatureOrder([...project.features, feature]);
    project.updatedAt = now;

    writeProjectStore(store);

    const saved = project.features.find((item) => item.id === feature.id) ?? feature;

    return {
      statusCode: 201,
      message: "Feature has been created.",
      data: toSummaryWithTicketCount(projectId, saved),
    };
  }

  const response = await api.post<ApiResponse<ProjectFeatureSummary>>(`/projects/${projectId}/features`, payload);
  return response.data;
}

export async function updateFeature(
  featureId: string,
  payload: UpdateFeaturePayload,
): Promise<ApiResponse<ProjectFeatureSummary>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureFeatureManager(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readProjectStore();
    const project = store.projects.find(
      (item) =>
        item.organizationId === sessionData.session.activeOrganizationId &&
        item.features.some((feature) => feature.id === featureId),
    );

    if (!project) {
      throw new Error("Feature not found.");
    }

    const feature = project.features.find((item) => item.id === featureId);

    if (!feature) {
      throw new Error("Feature not found.");
    }

    feature.name = payload.name ?? feature.name;
    feature.order = payload.order ?? feature.order;
    feature.updatedAt = new Date().toISOString();
    project.features = normalizeFeatureOrder(project.features);
    project.updatedAt = feature.updatedAt;

    writeProjectStore(store);

    const saved = project.features.find((item) => item.id === featureId) ?? feature;

    return {
      statusCode: 200,
      message: "Feature has been updated.",
      data: toSummaryWithTicketCount(project.id, saved),
    };
  }

  const response = await api.patch<ApiResponse<ProjectFeatureSummary>>(`/features/${featureId}`, payload);
  return response.data;
}

export async function deleteFeature(featureId: string): Promise<ApiResponse<null>> {
  if (appConfig.useMockApi) {
    await delay(220);

    const sessionData = getCurrentSessionOrThrow();
    ensureFeatureManager(sessionData.user);

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readProjectStore();
    const ticketStore = readTicketStore();
    const project = store.projects.find(
      (item) =>
        item.organizationId === sessionData.session.activeOrganizationId &&
        item.features.some((feature) => feature.id === featureId),
    );

    if (!project) {
      throw new Error("Feature not found.");
    }

    project.features = normalizeFeatureOrder(project.features.filter((item) => item.id !== featureId));
    project.updatedAt = new Date().toISOString();
    ticketStore.tickets = ticketStore.tickets.map((ticket) =>
      ticket.featureId === featureId
        ? {
            ...ticket,
            featureId: null,
            feature: null,
            updatedAt: project.updatedAt,
          }
        : ticket,
    );

    writeProjectStore(store);
    writeTicketStore(ticketStore);

    return {
      statusCode: 200,
      message: "Feature has been deleted.",
      data: null,
    };
  }

  const response = await api.delete<ApiResponse<null>>(`/features/${featureId}`);
  return response.data;
}
