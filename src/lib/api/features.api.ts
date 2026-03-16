import api from "@/lib/axios";
import { appConfig } from "@/lib/config/app";
import type {
  ApiResponse,
  CreateFeaturePayload,
  Project,
  ProjectFeature,
  ProjectFeatureSummary,
  SessionData,
  SessionUser,
  UpdateFeaturePayload,
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
  return { projects: [] };
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
    return { session: null, user: null };
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

function ensureFeatureManager(user: SessionUser) {
  if (!["TEAM_LEADER", "BUSINESS_ANALYST"].includes(user.role)) {
    throw new Error("Only team leaders and business analysts can manage features.");
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

export async function getProjectFeatures(
  projectId: string,
): Promise<ApiResponse<ProjectFeatureSummary[]>> {
  if (appConfig.useMockApi) {
    await delay(180);

    const sessionData = getCurrentSessionOrThrow();

    if (!sessionData.session.activeOrganizationId) {
      throw new Error("No active organization selected.");
    }

    const store = readMockStore();
    const project = getScopedProjectOrThrow(store, projectId, sessionData.session.activeOrganizationId);

    return {
      statusCode: 200,
      message: "Features have been found.",
      data: normalizeFeatureOrder(project.features).map(toSummary),
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

    const store = readMockStore();
    const project = getScopedProjectOrThrow(store, projectId, sessionData.session.activeOrganizationId);
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

    writeMockStore(store);

    const saved = project.features.find((item) => item.id === feature.id) ?? feature;

    return {
      statusCode: 201,
      message: "Feature has been created.",
      data: toSummary(saved),
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

    const store = readMockStore();
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

    writeMockStore(store);

    const saved = project.features.find((item) => item.id === featureId) ?? feature;

    return {
      statusCode: 200,
      message: "Feature has been updated.",
      data: toSummary(saved),
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

    const store = readMockStore();
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

    writeMockStore(store);

    return {
      statusCode: 200,
      message: "Feature has been deleted.",
      data: null,
    };
  }

  const response = await api.delete<ApiResponse<null>>(`/features/${featureId}`);
  return response.data;
}
