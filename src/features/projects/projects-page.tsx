"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, FolderKanban, Gauge, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { RoleAwarePageActions } from "@/components/layout/role-aware-page-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  formatDateTime,
  getNextProjectStep,
  getSyncFreshness,
} from "@/features/projects/project-utils";
import {
  createProjectSchema,
  type CreateProjectFormValues,
} from "@/features/projects/projects.schemas";
import { useInternalSession } from "@/features/auth/internal-session-context";
import { createProject, getProjects } from "@/lib/api/projects.api";
import { canPerformAction } from "@/lib/auth/permissions";
import { useUiStore } from "@/store/ui-store";
import type { Project } from "@/types/api";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useInternalSession();
  const showToast = useUiStore((state) => state.showToast);
  const userRole = sessionResponse?.data.user?.role;
  const canCreateProject = canPerformAction(userRole, "manageProjects");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 30_000,
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
    onSuccess: async (response) => {
      reset();
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      showToast({
        tone: "success",
        title: "Project created",
        description: `"${response.data.name}" is ready for setup.`,
      });
    },
    onError: (error) => {
      showToast({
        tone: "error",
        title: "Project creation failed",
        description:
          error instanceof Error ? error.message : "DevTrack could not create that project.",
      });
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
        eyebrow="Client delivery"
        icon={<FolderKanban className="h-5 w-5" strokeWidth={2.1} />}
        title="Projects"
        description="Track client engagements, spot stale syncs quickly, and guide the team into the next delivery setup step."
        actions={
          <RoleAwarePageActions
            items={[
              canCreateProject
                ? {
                    label: "Create project",
                    onClick: () => setIsCreateOpen(true),
                    icon: <Plus className="h-4 w-4" strokeWidth={2} />,
                  }
                : {
                    label: "Open organization",
                    href: "/organization",
                    variant: "ghost",
                    icon: <ArrowRight className="h-4 w-4" strokeWidth={2} />,
                  },
            ]}
          />
        }
      />

      <Modal
        description="Start with the client relationship details now. Notion setup, sync, feature grouping, and sharing happen next from the project detail flow."
        onClose={() => setIsCreateOpen(false)}
        open={canCreateProject && isCreateOpen}
        title="Create a client project"
      >
        <form className="space-y-4" onSubmit={handleCreateProject}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="project-name">
              Project name
            </label>
            <Input id="project-name" placeholder="Website Revamp" {...register("name")} />
            {errors.name ? <p className="text-sm text-[var(--danger)]">{errors.name.message}</p> : null}
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

          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting || createProjectMutation.isPending} type="submit">
              {isSubmitting || createProjectMutation.isPending ? "Creating project..." : "Create project"}
            </Button>
            <Button onClick={() => setIsCreateOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

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
            <ProjectCard
              key={project.id}
              progress={project.progressSummary?.overallProgress ?? 0}
              project={project}
            />
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
          icon={<FolderKanban className="h-6 w-6" strokeWidth={2.1} />}
        >
          {canCreateProject ? (
            <Button onClick={() => setIsCreateOpen(true)} type="button" variant="secondary">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create first project
            </Button>
          ) : null}
        </EmptyState>
      )}
    </div>
  );
}

function ProjectCard({
  project,
  progress,
}: {
  project: Project;
  progress: number;
}) {
  const freshness = getSyncFreshness(project.lastSyncedAt);
  const nextStep = getNextProjectStep(project);

  return (
    <Link
      aria-label={`Open project ${project.name}`}
      className="group block rounded-[var(--radius-xl)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
      href={`/projects/${project.id}`}
    >
      <Card className="p-6 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[color:color-mix(in_srgb,var(--primary)_26%,var(--border))] group-hover:shadow-[var(--shadow-md)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                  Client project
                </span>
                <FreshnessPill tone={freshness.tone} label={freshness.label} />
                <span className="inline-flex items-center gap-1 rounded-full border border-[color:color-mix(in_srgb,var(--primary)_20%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)] transition group-hover:border-[color:color-mix(in_srgb,var(--primary)_34%,var(--border))] group-hover:bg-[color:color-mix(in_srgb,var(--primary)_14%,var(--surface))]">
                  Open project
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
              </div>
              <div>
                <h2 className="max-w-xl text-2xl font-semibold text-balance transition group-hover:text-[var(--primary)]">
                  {project.name}
                </h2>
                <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                  {project.clientName} | {project.clientEmail}
                </p>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-right transition group-hover:border-[color:color-mix(in_srgb,var(--primary)_20%,var(--border))]">
              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
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
            <ProjectMetric label="Next step" value={nextStep.title} />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium leading-6">{value}</div>
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
      className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {label}
    </span>
  );
}
