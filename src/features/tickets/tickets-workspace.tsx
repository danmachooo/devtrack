"use client";

import {
  ArrowRight,
  Compass,
  FolderKanban,
  MapPinned,
  Sparkles,
  Target,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

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
        eyebrow="Ticket mapping"
        icon={<Ticket className="h-5 w-5" strokeWidth={2.1} />}
        title="Tickets"
        description="Map synced work into client-facing features one project at a time so the progress story stays intentional and accurate."
        actions={
          <RoleAwarePageActions
            items={[
              {
                label: "Open projects",
                href: "/projects",
                variant: "secondary",
                icon: <FolderKanban className="h-4 w-4" strokeWidth={2} />,
              },
              {
                label: "Manage assignments",
                href: selectedProjectId ? `/projects/${selectedProjectId}` : "/projects",
                action: "assignTickets",
                variant: "ghost",
                icon: <ArrowRight className="h-4 w-4" strokeWidth={2} />,
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
            <Ticket className="h-6 w-6" strokeWidth={2.1} />
          }
        >
          <LinkButton href="/projects">Open projects</LinkButton>
        </EmptyState>
      ) : selectedProject ? (
        <>
          <Card className="overflow-hidden border-[color:color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_7%,var(--surface))_0%,var(--surface)_38%,var(--background)_100%)] p-0">
            <div className="grid gap-0 lg:grid-cols-[1.12fr_0.88fr]">
              <div className="space-y-5 p-6 lg:p-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--foreground-muted)]">
                  <MapPinned className="h-3.5 w-3.5 text-[var(--primary)]" strokeWidth={2} />
                  Project scope
                </div>
                <div className="space-y-2">
                  <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-balance">
                    Keep ticket mapping anchored to one delivery track
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] text-pretty">
                    This workspace is intentionally project-scoped so search, triage, and bulk assignment stay tied to the same client story and progress model.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <ProjectScopeCallout
                    description="Review one project at a time so bulk actions never cross delivery boundaries."
                    icon={<Compass className="h-4 w-4" strokeWidth={2} />}
                    title="Focused mapping"
                  />
                  <ProjectScopeCallout
                    description="Return to the command center anytime for setup, sync, and sharing work."
                    icon={<ArrowRight className="h-4 w-4" strokeWidth={2} />}
                    title="Connected workflow"
                  />
                </div>
              </div>

              <div className="border-t border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_90%,var(--background))] p-6 lg:border-l lg:border-t-0 lg:p-7">
                <div className="space-y-4 rounded-[calc(var(--radius-lg)+2px)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-[var(--shadow-sm)]">
                  <div className="space-y-1.5">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                      Active project
                    </p>
                    <h3 className="text-lg font-semibold">Switch the mapping context</h3>
                    <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                      The selected project is stored in the URL so you can return directly to the same ticket workspace later.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="tickets-project-select">
                      Project
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
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[color:color-mix(in_srgb,var(--border)_82%,transparent)] px-6 py-6 lg:px-7">
              <SelectedProjectSummary project={selectedProject} />
            </div>
          </Card>

          <TicketReviewPanel key={selectedProject.id} project={selectedProject} />
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
    <div className="rounded-[calc(var(--radius-lg)+2px)] border border-[var(--border)] bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--surface)_84%,var(--background))_100%)] p-5">
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
            <h3 className="max-w-2xl text-xl font-semibold text-balance">{project.name}</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              {project.clientName} | {project.clientEmail}
            </p>
          </div>
        </div>

        <LinkButton href={`/projects/${project.id}`}>Open command center</LinkButton>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
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
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_92%,var(--background))] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium leading-6">{value}</div>
    </div>
  );
}

function ProjectScopeCallout({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--border)_86%,transparent)] bg-[color:color-mix(in_srgb,var(--surface)_84%,var(--background))] p-4 shadow-[var(--shadow-sm)]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
          {icon}
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">{description}</p>
        </div>
      </div>
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
      className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

function LinkButton({ children, href }: { children: string; href: string }) {
  return (
    <Link
      className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--primary)_24%,var(--border))] hover:bg-[var(--surface-muted)] hover:shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      href={href}
    >
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
      {children}
    </Link>
  );
}
