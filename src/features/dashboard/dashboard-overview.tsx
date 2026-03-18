"use client";

import { ArrowRight, Building2, FolderKanban, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { RoleAwarePageActions } from "@/components/layout/role-aware-page-actions";
import { Card } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { useDashboardOverview } from "@/features/dashboard/use-dashboard-overview";
import { canPerformAction } from "@/lib/auth/permissions";

export function DashboardOverview() {
  const { metrics, priorities, projectHealth, projects, projectsQuery, role } = useDashboardOverview();
  const canCreateProject = canPerformAction(role, "manageProjects");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace overview"
        title="Dashboard"
        description="Track project health, spot stale delivery signals quickly, and move the team into the next meaningful setup or sharing step."
        icon={<LayoutDashboard className="h-5 w-5" strokeWidth={2.1} />}
        actions={
          <RoleAwarePageActions
            items={[
              canCreateProject
                ? {
                    label: "Create project",
                    href: "/projects",
                    icon: <Plus className="h-4 w-4" strokeWidth={2} />,
                  }
                : {
                    label: "Open projects",
                    href: "/projects",
                    variant: "secondary",
                    icon: <FolderKanban className="h-4 w-4" strokeWidth={2} />,
                  },
              {
                label: "Manage organization",
                href: "/organization",
                action: "manageOrganization",
                variant: "ghost",
                icon: canCreateProject ? (
                  <Building2 className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                ),
              },
            ]}
          />
        }
      />

      {projectsQuery.isPending ? (
        <DashboardSkeleton />
      ) : projectsQuery.isError ? (
        <ErrorState
          title="Dashboard overview could not be loaded"
          description="DevTrack could not load the current project overview. Try again in a moment."
        />
      ) : !projects.length ? (
        <EmptyState
          title="No projects are active yet"
          description={
            canCreateProject
              ? "Create the first client delivery track to start Notion setup, sync work, and build toward a shareable client dashboard."
              : "No projects are available yet. A team leader can create the first delivery track from the projects area."
          }
          icon={<LayoutDashboard className="h-6 w-6" strokeWidth={2.1} />}
        >
          <LinkButton href="/projects">{canCreateProject ? "Create first project" : "Open projects"}</LinkButton>
        </EmptyState>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                detail={metric.detail}
                label={metric.label}
                tone={metric.tone}
                value={metric.value}
              />
            ))}
          </section>

          <section className="grid gap-5 2xl:grid-cols-[1.05fr_1.45fr]">
            <Card className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                  Next steps
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">Keep the delivery loop moving</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Priorities are ordered by the product workflow.
                    </p>
                  </div>
                  <InfoPopover label="More about dashboard priorities" align="left">
                    <p>
                      The dashboard stays overview-first. Detailed setup, mapping, and publishing
                      still happen in the project command center.
                    </p>
                  </InfoPopover>
                </div>
              </div>

              <div className="space-y-3">
                {priorities.map((priority, index) => (
                  <div
                    key={priority.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                          Priority {index + 1}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{priority.title}</h3>
                          <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                            {priority.description}
                          </p>
                        </div>
                      </div>
                      <LinkButton href={priority.href}>{priority.ctaLabel}</LinkButton>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-5 p-5 sm:p-6">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                  Project health
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">See what needs attention right now</h2>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      A quick view of freshness, progress, and the next project step.
                    </p>
                  </div>
                  <InfoPopover label="More about project health" align="left">
                    <p>
                      This section stays intentionally high level so project detail, ticket mapping,
                      and publishing still happen in their dedicated flows.
                    </p>
                  </InfoPopover>
                </div>
              </div>

              <div className="space-y-4">
                {projectHealth.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <FreshnessPill label={project.freshnessLabel} tone={project.freshnessTone} />
                          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                            {project.progress}% progress
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            <Link
                              className="transition hover:text-[var(--primary)]"
                              href={`/projects/${project.id}`}
                            >
                              {project.name}
                            </Link>
                          </h3>
                          <p className="text-sm text-[var(--foreground-muted)]">
                            {project.clientName} · {project.clientEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <LinkButton href={`/projects/${project.id}`}>Open project</LinkButton>
                      </div>
                    </div>

                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)] transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <ProjectMetric label="Last synced" value={project.lastSyncedLabel} />
                      <ProjectMetric label="Tickets" value={project.ticketsLabel} />
                      <ProjectMetric label="Features" value={project.featuresLabel} />
                      <ProjectMetric label="Next step" value={project.nextStepTitle} />
                    </div>

                    <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                      {project.nextStepDescription}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
  value: string;
}) {
  const accentClasses = {
    success: "text-[var(--success)]",
    warning: "text-[var(--warning)]",
    danger: "text-[var(--danger)]",
    neutral: "text-[var(--foreground)]",
  };

  return (
    <Card className="p-5">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</p>
        <div className={`text-4xl font-semibold ${accentClasses[tone]}`}>{value}</div>
        <p className="text-sm text-[var(--foreground-muted)]">{detail}</p>
      </div>
    </Card>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-3 p-5">
            <div className="h-4 w-24 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-10 w-16 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-12 animate-pulse rounded bg-[var(--surface-muted)]" />
          </Card>
        ))}
      </div>
      <div className="grid gap-5 2xl:grid-cols-[1.05fr_1.45fr]">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="space-y-4 p-6">
            <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-muted)]" />
            <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
            <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function FreshnessPill({
  label,
  tone,
}: {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral";
}) {
  const toneClasses = {
    success:
      "border-[color:color-mix(in_srgb,var(--success)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
    warning:
      "border-[color:color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
    danger:
      "border-[color:color-mix(in_srgb,var(--danger)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
    neutral: "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

function LinkButton({ children, href }: { children: string; href: string }) {
  return (
    <Link
      className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:w-auto"
      href={href}
    >
      {children}
    </Link>
  );
}
