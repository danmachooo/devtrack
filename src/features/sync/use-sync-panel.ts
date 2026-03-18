"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { triggerProjectSync } from "@/lib/api/sync.api";
import { getSyncCopy, type SyncUiState } from "@/features/sync/sync.utils";
import { useUiStore } from "@/store/ui-store";
import type { ApiResponse, Project } from "@/types/api";

export function useSyncPanel(projectId: string, lastSyncedAt: string | null) {
  const queryClient = useQueryClient();
  const showToast = useUiStore((state) => state.showToast);
  const [syncState, setSyncState] = useState<SyncUiState>("idle");
  const timeoutsRef = useRef<number[]>([]);

  const syncMutation = useMutation({
    mutationFn: () => triggerProjectSync(projectId),
    onError: (error) => {
      showToast({
        tone: "error",
        title: "Sync request failed",
        description:
          error instanceof Error ? error.message : "DevTrack could not schedule the manual sync.",
      });
    },
  });

  useEffect(() => {
    return () => {
      for (const timeout of timeoutsRef.current) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  async function triggerSync() {
    const response = await syncMutation.mutateAsync();

    if (response.data.alreadyQueued) {
      setSyncState("alreadyQueued");
      showToast({
        tone: "info",
        title: "Sync already queued",
        description: "This project already has a pending manual sync request.",
      });
      const timeout = window.setTimeout(() => setSyncState("idle"), 2_000);
      timeoutsRef.current.push(timeout);
      return;
    }

    const queuedAt = new Date().toISOString();
    syncProjectCaches(queryClient, projectId, (project) => ({
      ...project,
      lastSyncedAt: queuedAt,
      updatedAt: queuedAt,
    }));
    setSyncState("queued");
    showToast({
      tone: "success",
      title: "Manual sync queued",
      description: "DevTrack scheduled a fresh import from Notion.",
    });
    const queuedTimeout = window.setTimeout(() => setSyncState("syncing"), 900);
    const completeTimeout = window.setTimeout(async () => {
      setSyncState("completed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId, "tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId, "sync-logs"] }),
      ]);
    }, 2_400);
    const resetTimeout = window.setTimeout(() => setSyncState("idle"), 4_600);

    timeoutsRef.current.push(queuedTimeout, completeTimeout, resetTimeout);
  }

  return {
    syncState,
    syncMutation,
    syncCopy: getSyncCopy(syncState, lastSyncedAt),
    triggerSync,
  };
}

function syncProjectCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  updateProject: (project: Project) => Project,
) {
  queryClient.setQueryData<ApiResponse<Project>>(["project", projectId], (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      data: updateProject(current.data),
    };
  });

  queryClient.setQueryData<ApiResponse<Project[]>>(["projects"], (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      data: current.data.map((project) =>
        project.id === projectId ? updateProject(project) : project,
      ),
    };
  });
}
