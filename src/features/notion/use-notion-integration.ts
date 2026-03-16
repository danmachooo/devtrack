"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  connectNotion,
  getNotionDatabases,
  saveNotionStatusMapping,
  testNotionConnection,
} from "@/lib/api/notion.api";
import { buildStatusMappingPayload } from "@/features/notion/notion.utils";
import type {
  NotionConnectionFormValues,
  NotionStatusMappingFormValues,
} from "@/features/notion/notion.schemas";

type UseNotionIntegrationOptions = {
  canManageNotion: boolean;
  hasConnectedDatabase: boolean;
  resetConnectionForm: (databaseId: string) => void;
};

export function useNotionIntegration(
  projectId: string,
  options: UseNotionIntegrationOptions,
) {
  const queryClient = useQueryClient();

  const databasesQuery = useQuery({
    queryKey: ["project", projectId, "notion-databases"],
    queryFn: () => getNotionDatabases(projectId),
    enabled: options.canManageNotion && options.hasConnectedDatabase,
  });

  const testMutation = useMutation({
    mutationFn: (values: NotionConnectionFormValues) => testNotionConnection(projectId, values),
  });

  const connectMutation = useMutation({
    mutationFn: (values: NotionConnectionFormValues) => connectNotion(projectId, values),
    onSuccess: async () => {
      options.resetConnectionForm(connectMutation.variables?.databaseId ?? "");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId, "notion-databases"] }),
      ]);
    },
  });

  const saveMappingMutation = useMutation({
    mutationFn: (values: NotionStatusMappingFormValues) =>
      saveNotionStatusMapping(projectId, {
        statusMapping: buildStatusMappingPayload(values),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
  });

  return {
    databasesQuery,
    testMutation,
    connectMutation,
    saveMappingMutation,
    savedDatabase: databasesQuery.data?.data[0] ?? null,
    testResult: testMutation.data?.data ?? null,
  };
}
