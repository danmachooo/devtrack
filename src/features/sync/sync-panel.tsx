"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { triggerProjectSync } from "@/lib/api/sync.api";
import { formatDateTime, getSyncFreshness } from "@/features/projects/project-utils";
import type { Project } from "@/types/api";

type SyncPanelProps = {
  project: Project;
};

type SyncUiState = "idle" | "queued" | "syncing" | "alreadyQueued" | "completed";

export function SyncPanel({ project }: SyncPanelProps) {
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canTriggerSync = canPerformAction(role, "triggerManualSync");
  const [syncState, setSyncState] = useState<SyncUiState>("idle");
  const timeoutsRef = useRef<number[]>([]);

  const syncMutation = useMutation({
    mutationFn: () => triggerProjectSync(project.id),
  });

  useEffect(() => {
    return () => {
      for (const timeout of timeoutsRef.current) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  const freshness = getSyncFreshness(project.lastSyncedAt);
  const isBlocked = !project.notionDatabaseId || !project.statusMapping;

  const handleTriggerSync = async () => {
    const response = await syncMutation.mutateAsync();

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["project", project.id] }),
      queryClient.invalidateQueries({ queryKey: ["projects"] }),
      queryClient.invalidateQueries({ queryKey: ["project", project.id, "tickets"] }),
      queryClient.invalidateQueries({ queryKey: ["project", project.id, "sync-logs"] }),
    ]);

    if (response.data.alreadyQueued) {
      setSyncState("alreadyQueued");
      const timeout = window.setTimeout(() => setSyncState("idle"), 2_000);
      timeoutsRef.current.push(timeout);
      return;
    }

    setSyncState("queued");
    const queuedTimeout = window.setTimeout(() => setSyncState("syncing"), 900);
    const completeTimeout = window.setTimeout(async () => {
      setSyncState("completed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", project.id] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    }, 2_400);
    const resetTimeout = window.setTimeout(() => setSyncState("idle"), 4_600);

    timeoutsRef.current.push(queuedTimeout, completeTimeout, resetTimeout);
  };

  const syncCopy = getSyncCopy(syncState, project.lastSyncedAt);

  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Sync experience
          </p>
          <h2 className="text-2xl font-semibold">Keep freshness visible and stateful</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{syncCopy.description}</p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-right">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Last synced
          </div>
          <div className="mt-1 text-sm font-semibold">
            {project.lastSyncedAt ? formatDateTime(project.lastSyncedAt) : "Not synced yet"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
          <div className="flex flex-wrap items-center gap-2">
            <SyncBadge state={syncState} />
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              {freshness.label}
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold">{syncCopy.title}</p>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">{freshness.detail}</p>

          {canTriggerSync ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {!isBlocked ? (
                <Button
                  disabled={syncMutation.isPending || syncState === "queued" || syncState === "syncing"}
                  onClick={handleTriggerSync}
                  type="button"
                >
                  {syncMutation.isPending
                    ? "Scheduling..."
                    : syncState === "queued"
                      ? "Queued"
                      : syncState === "syncing"
                        ? "Syncing..."
                        : "Trigger manual sync"}
                </Button>
              ) : null}
              <span className="self-center text-sm text-[var(--foreground-muted)]">
                Allowed roles: Team Leader and Business Analyst
              </span>
            </div>
          ) : (
            <p className="mt-5 text-sm text-[var(--foreground-muted)]">
              Manual sync is available only to Team Leaders and Business Analysts.
            </p>
          )}

          {syncMutation.isError ? (
            <p className="mt-4 text-sm text-[var(--danger)]">
              {syncMutation.error instanceof Error
                ? syncMutation.error.message
                : "Sync could not be scheduled. Try again."}
            </p>
          ) : null}
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Sync readiness
          </p>
          <div className="mt-4 space-y-3 text-sm text-[var(--foreground-muted)]">
            <ReadinessRow
              complete={Boolean(project.notionDatabaseId)}
              label="Notion connection saved"
            />
            <ReadinessRow
              complete={Boolean(project.statusMapping && Object.keys(project.statusMapping).length)}
              label="Status mapping saved"
            />
            <ReadinessRow complete={Boolean(project.lastSyncedAt)} label="At least one sync recorded" />
          </div>

          {isBlocked ? (
            <div className="mt-5 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--warning)_30%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_10%,var(--surface))] p-4 text-sm text-[var(--foreground)]">
              Save the Notion connection and status mapping first. The sync panel stays visible so
              the dependency chain is obvious.
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ReadinessRow({ complete, label }: { complete: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2">
      <span>{label}</span>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
          complete
            ? "bg-[color:color-mix(in_srgb,var(--success)_15%,transparent)] text-[var(--success)]"
            : "bg-[var(--surface-muted)] text-[var(--foreground-muted)]"
        }`}
      >
        {complete ? "Ready" : "Pending"}
      </span>
    </div>
  );
}

function SyncBadge({ state }: { state: SyncUiState }) {
  const styles = {
    idle: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]",
    queued:
      "border-[color:color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]",
    syncing:
      "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]",
    alreadyQueued:
      "border-[color:color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]",
    completed:
      "border-[color:color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]",
  };

  const labels = {
    idle: "Idle",
    queued: "Queued",
    syncing: "Syncing",
    alreadyQueued: "Already queued",
    completed: "Completed",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles[state]}`}
    >
      {labels[state]}
    </span>
  );
}

function getSyncCopy(state: SyncUiState, lastSyncedAt: string | null) {
  switch (state) {
    case "queued":
      return {
        title: "Sync queued successfully",
        description: "The job is waiting to start. DevTrack keeps this state distinct so users know the request landed.",
      };
    case "syncing":
      return {
        title: "Sync in progress",
        description: "The project is actively refreshing source data. Hold here for a moment while the ticket snapshot catches up.",
      };
    case "alreadyQueued":
      return {
        title: "A sync is already queued",
        description: "The backend said this project already has a pending manual sync, so DevTrack avoids double-scheduling it.",
      };
    case "completed":
      return {
        title: "Sync completed",
        description: "Fresh project data has been recorded and the relevant project queries were invalidated.",
      };
    default:
      return {
        title: lastSyncedAt ? "Manual sync is available" : "First sync is still waiting",
        description: lastSyncedAt
          ? "Trigger a manual sync whenever the team needs a fresher snapshot from Notion."
          : "Once Notion is connected and statuses are mapped, the first sync brings the project to life.",
      };
  }
}
