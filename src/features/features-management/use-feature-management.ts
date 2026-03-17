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
    onSuccess: async (response) => {
      resetCreateForm();
      setSelectedFeatureId(response.data.id);
      await invalidateFeatureState(queryClient, projectId);
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; order?: number } }) =>
      updateFeature(id, payload),
    onSuccess: async () => {
      startTransition(() => setEditingFeatureId(null));
      await invalidateFeatureState(queryClient, projectId);
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: async (_, deletedFeatureId) => {
      setSelectedFeatureId((current) => (current === deletedFeatureId ? null : current));
      await invalidateFeatureState(queryClient, projectId);
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

async function invalidateFeatureState(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["project", projectId, "features"] }),
    queryClient.invalidateQueries({ queryKey: ["project", projectId, "tickets"] }),
    queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
  ]);
}
