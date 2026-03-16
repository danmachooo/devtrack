"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { RoleAwarePageActions } from "@/components/layout/role-aware-page-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { createProject, getProjects } from "@/lib/api/projects.api";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/features/projects/projects.schemas";
import type { Project } from "@/types/api";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useSession();
  const userRole = sessionResponse?.data.user?.role;
  const canCreateProject = canPerformAction(userRole, "manageProjects");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      clientName: "",
      clientEmail: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      reset();
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const projects = projectsQuery.data?.data ?? [];
  const sortedProjects = useMemo(
    () =>
      [...projects].sort((left, right) => {
        const leftTime = left.updatedAt ? new Date(left.updatedAt).getTime() : 0;
        const rightTime = right.updatedAt ? new Date(right.updatedAt).getTime() : 0;
        return rightTime - leftTime;
      }),
    [projects],
  );

  const handleCreateProject = handleSubmit((values) => {
    createProjectMutation.mutate(values);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Track client engagements, spot stale syncs quickly, and guide the team into the next delivery setup step."
        actions={
          <RoleAwarePageActions
            items={[
              canCreateProject
                ? {
                    label: isCreateOpen ? "Close project form" : "Create project",
                    onClick: () => setIsCreateOpen((current) => !current),
                  }
                : {
                    label: "Open organization",
                    href: "/organization",
                    variant: "ghost",
                  },
            ]}
          />
        }
      />

      {canCreateProject && isCreateOpen ? (
        <Card className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                New delivery track
              </p>
              <h2 className="text-2xl font-semibold">Create a client project</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Start with the client relationship details now. Notion setup, sync, feature
                grouping, and sharing happen next from the project detail flow.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCreateProject}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="project-name">
                  Project name
                </label>
                <Input id="project-name" placeholder="Website Revamp" {...register("name")} />
                {errors.name ? (
                  <p className="text-sm text-[var(--danger)]">{errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="client-name">
                  Client name
                </label>
                <Input id="client-name" placeholder="Acme Client" {...register("clientName")} />
                {errors.clientName ? (
                  <p className="text-sm text-[var(--danger)]">{errors.clientName.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="client-email">
                  Client email
                </label>
                <Input
                  id="client-email"
                  placeholder="client@example.com"
                  type="email"
                  {...register("clientEmail")}
                />
                {errors.clientEmail ? (
                  <p className="text-sm text-[var(--danger)]">{errors.clientEmail.message}</p>
                ) : null}
              </div>

              {createProjectMutation.isError ? (
                <p className="text-sm text-[var(--danger)]">
                  {createProjectMutation.error instanceof Error
                    ? createProjectMutation.error.message
                    : "Project creation failed. Try again."}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button disabled={isSubmitting || createProjectMutation.isPending} type="submit">
                  {isSubmitting || createProjectMutation.isPending
                    ? "Creating project..."
                    : "Create project"}
                </Button>
                <Button
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>
      ) : null}

      {projectsQuery.isPending ? (
        <ProjectListSkeleton />
      ) : projectsQuery.isError ? (
        <ErrorState
          title="Projects could not be loaded"
          description="DevTrack could not load the organization project list right now. Try again in a moment."
        />
      ) : sortedProjects.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No projects yet"
          description={
            canCreateProject
              ? "Create the first client delivery track to start Notion setup, sync work, and prepare a safe dashboard to share."
              : "No projects have been created for this organization yet. A team leader can create the first client delivery track from this screen."
          }
          icon={
            <div className="rounded-full bg-[color:color-mix(in_srgb,var(--primary)_14%,transparent)] p-3">
              <span className="text-sm font-semibold uppercase tracking-[0.16em]">Proj</span>
            </div>
          }
        >
          {canCreateProject ? (
            <Button onClick={() => setIsCreateOpen(true)} type="button" variant="secondary">
              Create first project
            </Button>
          ) : null}
        </EmptyState>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const progress = getProjectProgress(project);
  const freshness = getSyncFreshness(project.lastSyncedAt);

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                Client project
              </span>
              <FreshnessPill tone={freshness.tone} label={freshness.label} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{project.name}</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                {project.clientName} • {project.clientEmail}
              </p>
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              Progress
            </div>
            <div className="mt-1 text-3xl font-semibold">{progress}%</div>
            <div className="text-sm text-[var(--foreground-muted)]">
              {project.features.length
                ? `${project.features.length} feature groups ready`
                : "No features contributing yet"}
            </div>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <ProjectMetric
            label="Last synced"
            value={project.lastSyncedAt ? formatDateTime(project.lastSyncedAt) : "Not synced yet"}
          />
          <ProjectMetric
            label="Ticket count"
            value={`${project._count.tickets} synced ticket${project._count.tickets === 1 ? "" : "s"}`}
          />
          <ProjectMetric
            label="Next step"
            value={getNextStep(project)}
          />
        </div>
      </div>
    </Card>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="space-y-5 p-6">
          <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-muted)]" />
          <div className="h-12 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
            <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
            <div className="h-20 animate-pulse rounded-[var(--radius-md)] bg-[var(--surface-muted)]" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function FreshnessPill({
  tone,
  label,
}: {
  tone: "success" | "warning" | "danger" | "neutral";
  label: string;
}) {
  const toneClasses = {
    success:
      "border-[color:color-mix(in_srgb,var(--success)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_14%,transparent)] text-[var(--success)]",
    warning:
      "border-[color:color-mix(in_srgb,var(--warning)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_14%,transparent)] text-[var(--warning)]",
    danger:
      "border-[color:color-mix(in_srgb,var(--danger)_40%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_14%,transparent)] text-[var(--danger)]",
    neutral:
      "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}

function getProjectProgress(project: Project) {
  if (!project.features.length || !project._count.tickets) {
    return 0;
  }

  return 0;
}

function getNextStep(project: Project) {
  if (!project.notionDatabaseId) {
    return "Connect Notion";
  }

  if (!project.statusMapping) {
    return "Save status mapping";
  }

  if (!project.lastSyncedAt) {
    return "Run first sync";
  }

  if (!project.features.length) {
    return "Create feature groups";
  }

  if (!project._count.tickets) {
    return "Review imported tickets";
  }

  return "Review command center";
}

function getSyncFreshness(lastSyncedAt: string | null) {
  if (!lastSyncedAt) {
    return { tone: "neutral" as const, label: "Not synced" };
  }

  const elapsedHours = (Date.now() - new Date(lastSyncedAt).getTime()) / (1000 * 60 * 60);

  if (elapsedHours <= 24) {
    return { tone: "success" as const, label: "Fresh sync" };
  }

  if (elapsedHours <= 72) {
    return { tone: "warning" as const, label: "Aging sync" };
  }

  return { tone: "danger" as const, label: "Stale sync" };
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
