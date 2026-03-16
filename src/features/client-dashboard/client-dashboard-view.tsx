"use client";

import { ErrorState } from "@/components/feedback/error-state";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/features/projects/project-utils";
import {
  getActivityTone,
  getClientFeatureLabel,
  getClientFeatureTone,
  getClientFreshness,
} from "@/features/client-dashboard/client-dashboard.utils";
import { useClientDashboard } from "@/features/client-dashboard/use-client-dashboard";

type ClientDashboardViewProps = {
  token: string;
};

export function ClientDashboardView({ token }: ClientDashboardViewProps) {
  const dashboardQuery = useClientDashboard(token);

  if (dashboardQuery.isPending) {
    return <ClientDashboardSkeleton />;
  }

  if (dashboardQuery.isError) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title="This client link is not available"
          description={
            dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : "The dashboard link is invalid or the project is not ready to share."
          }
          actionLabel="Refresh"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const dashboard = dashboardQuery.data.data;
  const freshness = getClientFreshness(dashboard.lastSyncedAt);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--primary)_12%,var(--surface))_0%,var(--surface)_55%,color-mix(in_srgb,var(--background)_86%,var(--surface))_100%)] p-8 shadow-[var(--shadow-md)]">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
            Client Dashboard
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              {dashboard.projectName}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] md:text-base">
              A calm view of progress across the work your team is organizing and delivering.
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-4 pt-4">
            <div>
              <div className="text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Overall progress
              </div>
              <div className="text-6xl font-semibold">{dashboard.overallProgress}%</div>
            </div>
            <div className="min-w-56 flex-1 space-y-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_78%,transparent)] p-4">
              <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-[width]"
                  style={{ width: `${dashboard.overallProgress}%` }}
                />
              </div>
              <div className="text-sm text-[var(--foreground-muted)]">
                Progress is based on feature-level work grouped for client visibility.
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <MetricCard
            label="Last synced"
            value={dashboard.lastSyncedAt ? formatDateTime(dashboard.lastSyncedAt) : "Awaiting first sync"}
            detail={freshness.detail}
            tone={freshness.tone}
          />
          <MetricCard
            label="Features tracked"
            value={String(dashboard.features.length)}
            detail="Each feature groups the work into a simpler delivery story."
            tone="neutral"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
            Feature progress
          </p>
          <h2 className="text-2xl font-semibold">What is moving right now</h2>
        </div>

        {dashboard.features.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {dashboard.features.map((feature) => (
              <Card key={feature.name} className="space-y-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{feature.name}</h3>
                    <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                      {feature.completedTickets}/{feature.totalTickets} tickets complete
                    </p>
                  </div>
                  <TonePill
                    label={getClientFeatureLabel(feature.status)}
                    tone={getClientFeatureTone(feature.status)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-[width]"
                      style={{ width: `${feature.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--foreground-muted)]">Feature progress</span>
                    <span className="font-semibold">{feature.progress}%</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <p className="text-lg font-semibold">No feature progress to show yet</p>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              The team is still organizing the work into client-facing feature groups.
            </p>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
            Recent activity
          </p>
          <h2 className="text-2xl font-semibold">Recent project updates</h2>
        </div>

        {dashboard.recentActivity.length ? (
          <div className="space-y-3">
            {dashboard.recentActivity.map((activity, index) => (
              <Card key={`${activity.happenedAt}-${index}`} className="p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <TonePill label={activity.status.replace("_", " ")} tone={getActivityTone(activity.status)} />
                    <p className="text-base font-medium">{activity.message}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      {formatDateTime(activity.happenedAt)}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ActivityMetric label="Tickets added" value={String(activity.ticketsAdded)} />
                    <ActivityMetric label="Tickets updated" value={String(activity.ticketsUpdated)} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6">
            <p className="text-lg font-semibold">No recent activity yet</p>
            <p className="mt-2 text-sm text-[var(--foreground-muted)]">
              Once the team syncs project data, recent updates will appear here.
            </p>
          </Card>
        )}
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <Card className="space-y-2 p-6">
      <div className="text-sm uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      <TonePill label={tone === "neutral" ? "Calm" : tone} tone={tone} />
      <p className="text-sm text-[var(--foreground-muted)]">{detail}</p>
    </Card>
  );
}

function ActivityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function TonePill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const toneClasses = {
    success:
      "border-[color:color-mix(in_srgb,var(--success)_38%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]",
    warning:
      "border-[color:color-mix(in_srgb,var(--warning)_38%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]",
    danger:
      "border-[color:color-mix(in_srgb,var(--danger)_38%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)]",
    neutral: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}>
      {label}
    </span>
  );
}

function ClientDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="h-80 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="grid gap-4">
          <div className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          <div className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-52 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        ))}
      </div>
    </div>
  );
}
