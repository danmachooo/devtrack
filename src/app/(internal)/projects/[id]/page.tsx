"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type FormEventHandler, useEffect, useMemo, useState } from "react";
import { type FieldErrors, type UseFormRegister, useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { PageHeader } from "@/components/layout/page-header";
import { RoleAwarePageActions } from "@/components/layout/role-aware-page-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NotionIntegrationPanel } from "@/features/notion/notion-integration-panel";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { getProject, updateProject } from "@/lib/api/projects.api";
import {
  formatDateTime,
  getNextProjectStep,
  getProjectChecklist,
  getProjectProgress,
  getSyncFreshness,
} from "@/features/projects/project-utils";
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from "@/features/projects/projects.schemas";
import type { Project } from "@/types/api";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useSession();
  const userRole = sessionResponse?.data.user?.role;
  const canEditProject = canPerformAction(userRole, "manageProjects");
  const [isEditing, setIsEditing] = useState(false);

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
  });

  const project = projectQuery.data?.data;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectFormValues>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project?.name ?? "",
      clientName: project?.clientName ?? "",
      clientEmail: project?.clientEmail ?? "",
      syncInterval: project?.syncInterval ? String(project.syncInterval) : "",
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: (values: UpdateProjectFormValues) =>
      updateProject(projectId, {
        name: values.name,
        clientName: values.clientName,
        clientEmail: values.clientEmail,
        syncInterval: values.syncInterval ? Number(values.syncInterval) : undefined,
      }),
    onSuccess: async (response) => {
      reset({
        name: response.data.name,
        clientName: response.data.clientName,
        clientEmail: response.data.clientEmail,
        syncInterval: response.data.syncInterval ? String(response.data.syncInterval) : "",
      });
      setIsEditing(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
  });

  const checklist = useMemo(() => (project ? getProjectChecklist(project) : []), [project]);
  const nextStep = useMemo(() => (project ? getNextProjectStep(project) : null), [project]);

  useEffect(() => {
    if (!project) {
      return;
    }

    reset({
      name: project.name,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      syncInterval: project.syncInterval ? String(project.syncInterval) : "",
    });
  }, [project, reset]);

  if (projectQuery.isPending) {
    return <ProjectDetailSkeleton />;
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project detail"
          description="The project command center could not be loaded."
          actions={<RoleAwarePageActions items={[{ label: "Back to projects", href: "/projects" }]} />}
        />
        <ErrorState
          title="Project not available"
          description="This project could not be found in the active organization workspace."
        />
      </div>
    );
  }

  const progress = getProjectProgress(project);
  const freshness = getSyncFreshness(project.lastSyncedAt);
  const handleUpdateProject = handleSubmit((values) => {
    updateProjectMutation.mutate(values);
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title={project.name}
        description="This command center keeps setup steps, trust signals, and the next operational move visible in one place."
        actions={
          <RoleAwarePageActions
            items={[
              { label: "Back to projects", href: "/projects", variant: "ghost" },
              canEditProject
                ? {
                    label: isEditing ? "Close editor" : "Edit project",
                    onClick: () => setIsEditing((current) => !current),
                  }
                : { label: "Open organization", href: "/organization", variant: "secondary" },
            ]}
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                  Project command center
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
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-right">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Readiness
              </div>
              <div className="mt-1 text-4xl font-semibold">{progress}%</div>
              <div className="text-sm text-[var(--foreground-muted)]">Setup confidence signal</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <ProjectMeta label="Last synced" value={project.lastSyncedAt ? formatDateTime(project.lastSyncedAt) : "Not synced yet"} />
            <ProjectMeta
              label="Sync interval"
              value={project.syncInterval ? `${project.syncInterval} minutes` : "Not configured"}
            />
            <ProjectMeta
              label="Feature groups"
              value={`${project.features.length} feature${project.features.length === 1 ? "" : "s"}`}
            />
            <ProjectMeta
              label="Synced tickets"
              value={`${project._count.tickets} ticket${project._count.tickets === 1 ? "" : "s"}`}
            />
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Project metadata
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <MetadataRow label="Project ID" value={project.id} />
                <MetadataRow label="Created" value={formatDateTime(project.createdAt)} />
                <MetadataRow label="Last updated" value={formatDateTime(project.updatedAt)} />
                <MetadataRow
                  label="Client dashboard"
                  value="Access record created and ready for later retrieval"
                />
              </div>
            </div>
          </div>

          {canEditProject && isEditing ? <ProjectEditCard
            register={register}
            errors={errors}
            isSubmitting={isSubmitting}
            isPending={updateProjectMutation.isPending}
            isError={updateProjectMutation.isError}
            error={updateProjectMutation.error}
            onCancel={() => setIsEditing(false)}
            onSubmit={handleUpdateProject}
          /> : null}
        </Card>

        <div className="space-y-6">
          <Card className="space-y-5 p-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Next incomplete step
              </p>
              <h2 className="text-2xl font-semibold">{nextStep?.title}</h2>
              <p className="text-sm text-[var(--foreground-muted)]">{nextStep?.description}</p>
            </div>

            <ContextualGuidance project={project} />
          </Card>

          <Card className="space-y-4 p-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                Sync trust
              </p>
              <h3 className="text-xl font-semibold">{freshness.label}</h3>
              <p className="text-sm text-[var(--foreground-muted)]">{freshness.detail}</p>
            </div>

            <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground-muted)]">
              {project.lastSyncedAt
                ? `Latest sync recorded on ${formatDateTime(project.lastSyncedAt)}.`
                : "No sync history yet. Once the first sync runs, this panel becomes a trust signal for the whole project."}
            </div>
          </Card>
        </div>
      </div>

      <NotionIntegrationPanel project={project} />

      <Card className="space-y-6 p-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Six-step setup checklist
          </p>
          <h2 className="text-2xl font-semibold">Make the workflow obvious</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            The command center keeps the documented project sequence visible, even while later
            feature phases are still being built.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {checklist.map((step, index) => (
            <ChecklistCard
              key={step.id}
              index={index + 1}
              title={step.title}
              description={step.description}
              state={step.state}
            />
          ))}
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Why this page exists
          </p>
          <h2 className="text-xl font-semibold">Keep the screen intentional even when data is sparse</h2>
        </div>

        {project._count.tickets === 0 && project.features.length === 0 ? (
          <EmptyState
            title="The project is still in setup mode"
            description="That is expected. This command center is meant to feel directional before tickets, features, and client sharing are all available."
          />
        ) : (
          <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground-muted)]">
            The project now has enough structure to move from setup into active organization and
            client storytelling. As later phases land, this page will absorb feature, sync, and
            sharing controls directly.
          </div>
        )}
      </Card>

      <div className="text-sm text-[var(--foreground-muted)]">
        <Link className="font-semibold text-[var(--primary)]" href="/projects">
          Back to all projects
        </Link>
      </div>
    </div>
  );
}

type ProjectEditCardProps = {
  register: UseFormRegister<UpdateProjectFormValues>;
  errors: FieldErrors<UpdateProjectFormValues>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onCancel: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

function ProjectEditCard({
  errors,
  register,
  isSubmitting,
  isPending,
  isError,
  error,
  onCancel,
  onSubmit,
}: ProjectEditCardProps) {
  return (
    <Card className="border-[color:color-mix(in_srgb,var(--primary)_26%,var(--border))] p-6">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Team leader tools
          </p>
          <h3 className="text-xl font-semibold">Edit project metadata</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Keep the client-facing basics accurate here. Sync interval stays within the documented
            `5-60` minute window.
          </p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="detail-project-name">
              Project name
            </label>
            <Input id="detail-project-name" {...register("name")} />
            {errors.name ? <p className="text-sm text-[var(--danger)]">{errors.name.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="detail-client-name">
              Client name
            </label>
            <Input id="detail-client-name" {...register("clientName")} />
            {errors.clientName ? (
              <p className="text-sm text-[var(--danger)]">{errors.clientName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="detail-client-email">
              Client email
            </label>
            <Input id="detail-client-email" type="email" {...register("clientEmail")} />
            {errors.clientEmail ? (
              <p className="text-sm text-[var(--danger)]">{errors.clientEmail.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="detail-sync-interval">
              Sync interval
            </label>
            <Input
              id="detail-sync-interval"
              inputMode="numeric"
              placeholder="15"
              {...register("syncInterval")}
            />
            {errors.syncInterval ? (
              <p className="text-sm text-[var(--danger)]">{errors.syncInterval.message?.toString()}</p>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">
                Optional. Enter a value from 5 to 60 minutes.
              </p>
            )}
          </div>

          {isError ? (
            <p className="text-sm text-[var(--danger)]">
              {error instanceof Error ? error.message : "Project update failed. Try again."}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button disabled={isSubmitting || isPending} type="submit">
              {isSubmitting || isPending ? "Saving..." : "Save changes"}
            </Button>
            <Button onClick={onCancel} type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

function ProjectMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</div>
      <div className="mt-2 text-sm font-medium">{value}</div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</div>
      <div className="break-all text-sm font-medium">{value}</div>
    </div>
  );
}

function ContextualGuidance({ project }: { project: Project }) {
  if (!project.notionDatabaseId) {
    return (
      <EmptyState
        title="Connect the source of truth first"
        description="Without a Notion connection, the rest of the project flow cannot become trustworthy. This page keeps that dependency visible on purpose."
      />
    );
  }

  if (!project.statusMapping || Object.keys(project.statusMapping).length === 0) {
    return (
      <EmptyState
        title="Progress logic is not defined yet"
        description="Status mapping is what tells DevTrack how to interpret your workflow. Until it is saved, progress should not pretend to be meaningful."
      />
    );
  }

  if (!project.lastSyncedAt) {
    return (
      <EmptyState
        title="Tickets have not arrived yet"
        description="Once the first sync runs, this page can become operational instead of preparatory."
      />
    );
  }

  if (project.features.length === 0) {
    return (
      <EmptyState
        title="The client story still needs feature groups"
        description="Synced tickets are internal raw material. Feature groups are what turn them into a presentation-ready progress narrative."
      />
    );
  }

  if (project._count.tickets === 0) {
    return (
      <EmptyState
        title="Review sync coverage before assignment"
        description="Feature buckets exist, but no synced tickets are available to organize yet."
      />
    );
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground-muted)]">
      Tickets and feature groups are both present. The next iteration of this command center can
      now focus on assignment, sync controls, and client-sharing readiness.
    </div>
  );
}

function ChecklistCard({
  index,
  title,
  description,
  state,
}: {
  index: number;
  title: string;
  description: string;
  state: "complete" | "current" | "upcoming";
}) {
  const stateClasses = {
    complete:
      "border-[color:color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_10%,var(--surface))]",
    current:
      "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))]",
    upcoming: "border-[var(--border)] bg-[var(--surface)]",
  };

  const badgeClasses = {
    complete: "bg-[var(--success)] text-white",
    current: "bg-[var(--primary)] text-[var(--primary-foreground)]",
    upcoming: "bg-[var(--surface-muted)] text-[var(--foreground-muted)]",
  };

  const labels = {
    complete: "Complete",
    current: "Current",
    upcoming: "Upcoming",
  };

  return (
    <div className={`rounded-[var(--radius-lg)] border p-5 ${stateClasses[state]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${badgeClasses[state]}`}>
          Step {index}
        </div>
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
          {labels[state]}
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
      </div>
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

function ProjectDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="h-[28rem] animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        </div>
      </div>
      <div className="h-72 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
    </div>
  );
}
