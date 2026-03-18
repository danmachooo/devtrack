"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  connectNotion,
  getNotionDatabases,
  saveNotionStatusMapping,
  testNotionConnection,
} from "@/lib/api/notion.api";
import { buildStatusMappingPayload } from "@/features/notion/notion.utils";
import { useUiStore } from "@/store/ui-store";
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
  const showToast = useUiStore((state) => state.showToast);

  const databasesQuery = useQuery({
    queryKey: ["project", projectId, "notion-databases"],
    queryFn: () => getNotionDatabases(projectId),
    enabled: options.canManageNotion && options.hasConnectedDatabase,
  });

  const testMutation = useMutation({
    mutationFn: (values: NotionConnectionFormValues) => testNotionConnection(projectId, values),
    onSuccess: (response) => {
      showToast({
        tone: "success",
        title: "Notion connection verified",
        description: `Database "${response.data.databaseTitle}" is reachable and ready to save.`,
      });
    },
    onError: (error) => {
      showToast({
        tone: "error",
        title: "Notion test failed",
        description:
          error instanceof Error ? error.message : "DevTrack could not verify that database.",
      });
    },
  });

  const connectMutation = useMutation({
    mutationFn: (values: NotionConnectionFormValues) => connectNotion(projectId, values),
    onSuccess: async (response) => {
      options.resetConnectionForm(connectMutation.variables?.databaseId ?? "");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId, "notion-databases"] }),
      ]);
      showToast({
        tone: "success",
        title: "Notion connection saved",
        description: `DevTrack is now connected to "${response.data.databaseTitle}".`,
      });
    },
    onError: (error) => {
      showToast({
        tone: "error",
        title: "Could not save Notion connection",
        description:
          error instanceof Error ? error.message : "DevTrack could not save that database.",
      });
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
      showToast({
        tone: "success",
        title: "Status mapping saved",
        description: "Progress can now use the current Notion status translation.",
      });
    },
    onError: (error) => {
      showToast({
        tone: "error",
        title: "Could not save status mapping",
        description:
          error instanceof Error ? error.message : "DevTrack could not save the mapping.",
      });
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
