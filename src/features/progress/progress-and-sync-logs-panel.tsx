"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { Card } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { formatDateTime } from "@/features/projects/project-utils";
import { FeatureStatusPill } from "@/features/progress/components/feature-status-pill";
import { SyncLogSkeleton } from "@/features/progress/components/sync-log-skeleton";
import { SyncMetric } from "@/features/progress/components/sync-metric";
import { SyncStatusPill } from "@/features/progress/components/sync-status-pill";
import { getSyncMessage } from "@/features/progress/sync-log.utils";
import { useProjectProgress } from "@/features/progress/use-project-progress";
import type { Project } from "@/types/api";

type ProgressAndSyncLogsPanelProps = {
  project: Project;
};

export function ProgressAndSyncLogsPanel({ project }: ProgressAndSyncLogsPanelProps) {
  const { aggregateProgress, featureProgress, syncLogs, syncLogsQuery } = useProjectProgress(project);

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          Progress and sync logs
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Track progress and sync health</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Progress and recent sync outcomes stay visible together.
            </p>
          </div>
          <InfoPopover label="More about progress and sync logs">
            <p>Progress reflects assigned, non-missing tickets only.</p>
            <p className="mt-2">
              Keeping sync history nearby makes freshness problems and failed imports easier to
              inspect.
            </p>
          </InfoPopover>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Aggregate project progress
          </p>
          <div className="mt-3 text-5xl font-semibold">{aggregateProgress}%</div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-[var(--surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width]"
              style={{ width: `${aggregateProgress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-[var(--foreground-muted)]">
            {featureProgress.length
              ? `Average across ${featureProgress.length} feature${featureProgress.length === 1 ? "" : "s"}.`
              : "Create features and assign tickets before aggregate progress becomes meaningful."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {featureProgress.length ? (
            featureProgress.map((feature) => (
              <div
                key={feature.featureId}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">{feature.featureName}</p>
                  <FeatureStatusPill status={feature.status} />
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-[width]"
                    style={{ width: `${feature.progress}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-[var(--foreground-muted)]">
                    {feature.completedTickets}/{feature.totalTickets} complete
                  </span>
                  <span className="font-semibold">{feature.progress}%</span>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2">
              {project.features.length ? (
                <EmptyState
                  title="No feature progress yet"
                  description="Feature progress appears once assigned, non-missing tickets contribute work to the project summary."
                />
              ) : (
                <EmptyState
                  title="No feature progress yet"
                  description="Create client-facing features and assign tickets before the project summary can show progress by feature."
                />
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Recent sync history
          </p>
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-semibold">Recent sync history</h3>
            <InfoPopover label="More about sync history" align="left">
              <p>
                Sync logs are internal diagnostics. They help the team check whether recent imports
                succeeded, failed, or were rate limited.
              </p>
            </InfoPopover>
          </div>
        </div>

        {syncLogsQuery.isPending ? (
          <SyncLogSkeleton />
        ) : syncLogs.length ? (
          <div className="space-y-3">
            {syncLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <SyncStatusPill status={log.status} />
                    <p className="text-sm text-[var(--foreground-muted)]">{formatDateTime(log.createdAt)}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <SyncMetric label="Added" value={String(log.ticketsAdded)} />
                    <SyncMetric label="Updated" value={String(log.ticketsUpdated)} />
                    <SyncMetric label="Message" value={log.errorMessage ?? getSyncMessage(log.status)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No sync history yet"
            description="Sync logs will appear here after the first Notion sync attempt, with success and failure outcomes called out clearly."
          />
        )}
      </div>
    </Card>
  );
}
