"use client";

import Link from "next/link";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { RoleAwarePageActions } from "@/components/layout/role-aware-page-actions";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { formatDateTime, getNextProjectStep, getSyncFreshness } from "@/features/projects/project-utils";
import { TicketReviewPanel } from "@/features/tickets/ticket-review-panel";
import { useTicketsWorkspace } from "@/features/tickets/use-tickets-workspace";

export function TicketsWorkspace() {
  const { actions, projects, projectsQuery, selectedProject, selectedProjectId } = useTicketsWorkspace();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tickets"
        description="Map synced work into client-facing features one project at a time so the progress story stays intentional and accurate."
        actions={
          <RoleAwarePageActions
            items={[
              {
                label: "Open projects",
                href: "/projects",
                variant: "secondary",
              },
              {
                label: "Manage assignments",
                href: selectedProjectId ? `/projects/${selectedProjectId}` : "/projects",
                action: "assignTickets",
                variant: "ghost",
              },
            ]}
          />
        }
      />

      {projectsQuery.isPending ? (
        <TicketsWorkspaceSkeleton />
      ) : projectsQuery.isError ? (
        <ErrorState
          title="Tickets workspace could not be loaded"
          description="DevTrack could not load the available projects for ticket review right now. Try again in a moment."
        />
      ) : !projects.length ? (
        <EmptyState
          title="No projects are ready for ticket review yet"
          description="Create the first client delivery track before the team can start syncing work, reviewing tickets, and mapping them into features."
          icon={
            <div className="rounded-full bg-[color:color-mix(in_srgb,var(--primary)_14%,transparent)] p-3">
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Tick</span>
            </div>
          }
        >
          <LinkButton href="/projects">Open projects</LinkButton>
        </EmptyState>
      ) : selectedProject ? (
        <>
          <Card className="space-y-5 p-6">
            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                  Project scope
                </p>
                <h2 className="text-2xl font-semibold">Choose the project you want to organize</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Ticket assignment is project-scoped, so this workspace stays focused on one delivery track at a time.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="tickets-project-select">
                  Active project
                </label>
                <Select
                  id="tickets-project-select"
                  onChange={(event) => actions.setSelectedProject(event.target.value)}
                  value={selectedProject.id}
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} | {project.clientName}
                    </option>
                  ))}
                </Select>
                <p className="text-sm text-[var(--foreground-muted)]">
                  The selected project is stored in the URL so you can return directly to the same mapping context.
                </p>
              </div>
            </div>

            <SelectedProjectSummary project={selectedProject} />
          </Card>

          <TicketReviewPanel project={selectedProject} />
        </>
      ) : (
        <TicketsWorkspaceSkeleton />
      )}
    </div>
  );
}

function SelectedProjectSummary({
  project,
}: {
  project: NonNullable<ReturnType<typeof useTicketsWorkspace>["selectedProject"]>;
}) {
  const freshness = getSyncFreshness(project.lastSyncedAt);
  const nextStep = getNextProjectStep(project);

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <FreshnessPill label={freshness.label} tone={freshness.tone} />
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              {project._count.tickets} synced ticket{project._count.tickets === 1 ? "" : "s"}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              {project.features.length} feature{project.features.length === 1 ? "" : "s"}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{project.name}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {project.clientName} | {project.clientEmail}
            </p>
          </div>
        </div>

        <LinkButton href={`/projects/${project.id}`}>Open command center</LinkButton>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ProjectMetric
          label="Last synced"
          value={project.lastSyncedAt ? formatDateTime(project.lastSyncedAt) : "Awaiting first sync"}
        />
        <ProjectMetric label="Freshness" value={freshness.detail} />
        <ProjectMetric label="Next step" value={nextStep.title} />
      </div>
    </div>
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

function TicketsWorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="h-11 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
        <div className="grid gap-3 md:grid-cols-3">
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
        </div>
      </Card>
      <Card className="space-y-4 p-6">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
        </div>
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      </Card>
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
      className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      href={href}
    >
      {children}
    </Link>
  );
}
