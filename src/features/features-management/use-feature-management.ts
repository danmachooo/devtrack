"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useEffect, useState } from "react";

import {
  createFeature,
  deleteFeature,
  getProjectFeatures,
  updateFeature,
} from "@/lib/api/features.api";
import type { CreateFeatureFormValues } from "@/features/features-management/feature.schemas";
import type {
  ApiResponse,
  Project,
  ProjectFeature,
  ProjectFeatureSummary,
  TicketListData,
} from "@/types/api";

export function useFeatureManagement(projectId: string, resetCreateForm: () => void) {
  const queryClient = useQueryClient();
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  const featuresQuery = useQuery({
    queryKey: ["project", projectId, "features"],
    queryFn: () => getProjectFeatures(projectId),
  });

  const features = featuresQuery.data?.data ?? [];
  const selectedFeature = features.find((feature) => feature.id === selectedFeatureId) ?? null;

  useEffect(() => {
    if (!features.length) {
      setSelectedFeatureId(null);
      return;
    }

    if (!selectedFeatureId || !features.some((feature) => feature.id === selectedFeatureId)) {
      setSelectedFeatureId(features[0].id);
    }
  }, [features, selectedFeatureId]);

  const createFeatureMutation = useMutation({
    mutationFn: (values: CreateFeatureFormValues) => createFeature(projectId, values),
    onSuccess: (response) => {
      resetCreateForm();
      setSelectedFeatureId(response.data.id);
      syncFeatureCaches(queryClient, projectId, {
        type: "create",
        feature: response.data,
      });
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; order?: number } }) =>
      updateFeature(id, payload),
    onSuccess: (response) => {
      startTransition(() => setEditingFeatureId(null));
      syncFeatureCaches(queryClient, projectId, {
        type: "update",
        feature: response.data,
      });
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: (_, deletedFeatureId) => {
      setSelectedFeatureId((current) => (current === deletedFeatureId ? null : current));
      syncFeatureCaches(queryClient, projectId, {
        type: "delete",
        featureId: deletedFeatureId,
      });
    },
  });

  return {
    features,
    selectedFeature,
    featuresQuery,
    editingFeatureId,
    selectedFeatureId,
    createFeatureMutation,
    updateFeatureMutation,
    deleteFeatureMutation,
    actions: {
      selectFeature(featureId: string) {
        setSelectedFeatureId(featureId);
      },
      toggleEditingFeature(featureId: string) {
        setEditingFeatureId((current) => (current === featureId ? null : featureId));
        setSelectedFeatureId(featureId);
      },
      createFeature(values: CreateFeatureFormValues) {
        createFeatureMutation.mutate(values);
      },
      renameFeature(id: string, name: string) {
        updateFeatureMutation.mutate({ id, payload: { name } });
      },
      moveFeature(id: string, order: number) {
        updateFeatureMutation.mutate({ id, payload: { order } });
      },
      deleteFeature(id: string) {
        deleteFeatureMutation.mutate(id);
      },
    },
  };
}

type FeatureCacheMutation =
  | {
      type: "create";
      feature: ProjectFeatureSummary;
    }
  | {
      type: "update";
      feature: ProjectFeatureSummary;
    }
  | {
      type: "delete";
      featureId: string;
    };

function syncFeatureCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  mutation: FeatureCacheMutation,
) {
  queryClient.setQueryData<ApiResponse<ProjectFeatureSummary[]>>(
    ["project", projectId, "features"],
    (current) => {
      if (!current) {
        return current;
      }

      const nextFeatures = applyFeatureMutation(current.data, mutation);

      return {
        ...current,
        data: nextFeatures,
      };
    },
  );

  queryClient.setQueryData<ApiResponse<Project>>(["project", projectId], (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      data: {
        ...current.data,
        features: applyProjectFeatureMutation(current.data.features, mutation),
      },
    };
  });

  queryClient.setQueryData<ApiResponse<Project[]>>(["projects"], (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      data: current.data.map((project) =>
        project.id === projectId
          ? {
              ...project,
              features: applyProjectFeatureMutation(project.features, mutation),
            }
          : project,
      ),
    };
  });

  queryClient.setQueriesData<ApiResponse<TicketListData>>(
    { queryKey: ["project", projectId, "tickets"] },
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          items: current.data.items.map((ticket) => {
            if (mutation.type === "delete" && ticket.featureId === mutation.featureId) {
              return {
                ...ticket,
                featureId: null,
                feature: null,
              };
            }

            if (
              mutation.type === "update" &&
              ticket.featureId === mutation.feature.id &&
              ticket.feature
            ) {
              return {
                ...ticket,
                feature: {
                  ...ticket.feature,
                  name: mutation.feature.name,
                  order: mutation.feature.order,
                },
              };
            }

            return ticket;
          }),
        },
      };
    },
  );
}

function applyFeatureMutation(
  features: ProjectFeatureSummary[],
  mutation: FeatureCacheMutation,
) {
  if (mutation.type === "delete") {
    return normalizeFeatureSummaries(features.filter((feature) => feature.id !== mutation.featureId));
  }

  const remaining = features.filter((feature) => feature.id !== mutation.feature.id);
  return normalizeFeatureSummaries([...remaining, mutation.feature]);
}

function applyProjectFeatureMutation(
  features: ProjectFeature[],
  mutation: FeatureCacheMutation,
) {
  if (mutation.type === "delete") {
    return normalizeProjectFeatures(features.filter((feature) => feature.id !== mutation.featureId));
  }

  const nextFeature: ProjectFeature = {
    id: mutation.feature.id,
    name: mutation.feature.name,
    order: mutation.feature.order,
    projectId: mutation.feature.projectId,
    createdAt: mutation.feature.createdAt,
    updatedAt: mutation.feature.updatedAt,
  };

  const remaining = features.filter((feature) => feature.id !== mutation.feature.id);
  return normalizeProjectFeatures([...remaining, nextFeature]);
}

function normalizeFeatureSummaries(features: ProjectFeatureSummary[]) {
  return [...features]
    .sort((left, right) => left.order - right.order)
    .map((feature, index) => ({
      ...feature,
      order: index,
    }));
}

function normalizeProjectFeatures(features: ProjectFeature[]) {
  return [...features]
    .sort((left, right) => left.order - right.order)
    .map((feature, index) => ({
      ...feature,
      order: index,
    }));
}
