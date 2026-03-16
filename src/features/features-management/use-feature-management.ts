"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";

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

  const featuresQuery = useQuery({
    queryKey: ["project", projectId, "features"],
    queryFn: () => getProjectFeatures(projectId),
  });

  const createFeatureMutation = useMutation({
    mutationFn: (values: CreateFeatureFormValues) => createFeature(projectId, values),
    onSuccess: async () => {
      resetCreateForm();
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
    onSuccess: async () => {
      await invalidateFeatureState(queryClient, projectId);
    },
  });

  return {
    features: featuresQuery.data?.data ?? [],
    featuresQuery,
    editingFeatureId,
    createFeatureMutation,
    updateFeatureMutation,
    deleteFeatureMutation,
    actions: {
      toggleEditingFeature(featureId: string) {
        setEditingFeatureId((current) => (current === featureId ? null : featureId));
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
    queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
  ]);
}
