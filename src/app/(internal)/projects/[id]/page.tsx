"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  ClipboardList,
  FolderTree,
  Gauge,
  Radar,
  Route,
  Settings2,
} from "lucide-react";
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
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ClientAccessPanel } from "@/features/client-access/client-access-panel";
import { FeatureManagementPanel } from "@/features/features-management/feature-management-panel";
import { NotionIntegrationPanel } from "@/features/notion/notion-integration-panel";
import { ProgressAndSyncLogsPanel } from "@/features/progress/progress-and-sync-logs-panel";
import {
  formatDateTime,
  getNextProjectStep,
  getProjectChecklist,
  getSyncFreshness,
  type ProjectChecklistStep,
} from "@/features/projects/project-utils";
import {
  updateProjectSchema,
  type UpdateProjectFormValues,
} from "@/features/projects/projects.schemas";
import { SyncPanel } from "@/features/sync/sync-panel";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { getProject, updateProject } from "@/lib/api/projects.api";
import type { Project } from "@/types/api";

type WorkspaceTab = "organization" | "health";
type SetupStepId =
  | "connect-notion"
  | "save-mapping"
  | "run-sync"
  | "create-features"
  | "assign-tickets"
  | "share-client-link";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useSession();
  const userRole = sessionResponse?.data.user?.role;
  const canEditProject = canPerformAction(userRole, "manageProjects");
  const canManageNotion = canPerformAction(userRole, "manageNotion");
  const canManageFeatures = canPerformAction(userRole, "manageFeatures");
  const canAssignTickets = canPerformAction(userRole, "assignTickets");
  const canViewClientAccess = canPerformAction(userRole, "viewClientAccess");
  const [isEditing, setIsEditing] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("organization");

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
    enabled: Boolean(projectId),
    refetchOnWindowFocus: true,
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
  const activeStepId = useMemo(() => getActiveStepId(checklist), [checklist]);
  const activeStep = useMemo(
    () => checklist.find((step) => step.id === activeStepId) ?? null,
    [activeStepId, checklist],
  );

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
          eyebrow="Project workspace"
          icon={<FolderTree className="h-5 w-5" strokeWidth={2.1} />}
          title="Project detail"
          description="The project setup workspace could not be loaded."
          actions={<RoleAwarePageActions items={[{ label: "Back to projects", href: "/projects" }]} />}
        />
        <ErrorState
          title="Project not available"
          description="This project could not be found in the active organization workspace."
        />
      </div>
    );
  }

  const completedSetupMilestones = checklist.filter((step) => step.state === "complete").length;
  const totalSetupMilestones = checklist.length;
  const freshness = getSyncFreshness(project.lastSyncedAt);
  const handleUpdateProject = handleSubmit((values) => {
    updateProjectMutation.mutate(values);
  });

  const canLaunchSetup = Boolean(
    activeStepId &&
      ((activeStepId === "connect-notion" && canManageNotion) ||
        (activeStepId === "save-mapping" && canManageNotion) ||
        (activeStepId === "run-sync" && canPerformAction(userRole, "triggerManualSync")) ||
        (activeStepId === "create-features" && canManageFeatures) ||
        (activeStepId === "share-client-link" && canViewClientAccess)),
  );

  const handleContinueSetup = () => {
    if (!activeStepId) {
      return;
    }

    if (activeStepId === "assign-tickets") {
      return;
    }

    if (canLaunchSetup) {
      setIsSetupModalOpen(true);
    }
  };

  const setupActionLabel = getSetupActionLabel(activeStepId, canLaunchSetup, canAssignTickets);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Guided setup"
        icon={<FolderTree className="h-5 w-5" strokeWidth={2.1} />}
        title={project.name}
        description="Guide setup first, then drop into the operational workspace when the project is ready."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <HeaderSyncSignal freshness={freshness} lastSyncedAt={project.lastSyncedAt} />
            <RoleAwarePageActions
              items={[
                { label: "Back to projects", href: "/projects", variant: "ghost" },
                canEditProject
                  ? {
                      label: "Edit project",
                      onClick: () => setIsEditing(true),
                      icon: <Settings2 className="h-4 w-4" strokeWidth={2} />,
                    }
                  : {
                      label: "Open organization",
                      href: "/organization",
                      variant: "secondary",
                      icon: <ArrowRight className="h-4 w-4" strokeWidth={2} />,
                    },
              ]}
            />
          </div>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="h-fit space-y-6 p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                  Guided project setup
                </span>
                <FreshnessPill tone={freshness.tone} label={freshness.label} />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{project.name}</h2>
                <p className="text-sm text-[var(--foreground-muted)]">
                  {project.clientName} | {project.clientEmail}
                </p>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-right">
              <div className="flex items-center justify-end gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
                Setup readiness
              </div>
              <div className="mt-1 text-4xl font-semibold">
                {completedSetupMilestones} of {totalSetupMilestones}
              </div>
              <div className="text-sm font-medium text-[var(--foreground)]">
                {completedSetupMilestones === totalSetupMilestones
                  ? "Setup complete"
                  : "Guided steps complete"}
              </div>
              <div className="text-sm text-[var(--foreground-muted)]">
                {completedSetupMilestones === totalSetupMilestones
                  ? "Ready for operational tracking"
                  : `${totalSetupMilestones - completedSetupMilestones} setup step${
                      totalSetupMilestones - completedSetupMilestones === 1 ? "" : "s"
                    } remaining`}
              </div>
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
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                  Project snapshot
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Keep the trust signals and operational context nearby without forcing the full
                  command center into view all at once.
                </p>
              </div>
              <InfoPopover label="More about project setup" align="left">
                <p>
                  The page now prioritizes the next setup action first. Lower-priority operational
                  tools stay available in the workspace area below.
                </p>
              </InfoPopover>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <MetadataRow label="Project ID" value={project.id} />
              <MetadataRow label="Created" value={formatDateTime(project.createdAt)} />
              <MetadataRow label="Last updated" value={formatDateTime(project.updatedAt)} />
              <MetadataRow
                label="Client dashboard"
                value="Access record created and ready when sharing is appropriate"
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="h-fit space-y-5 p-6">
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                <Radar className="h-3.5 w-3.5" strokeWidth={2} />
                Next guided step
              </p>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold">{nextStep?.title ?? "Project is staged"}</h2>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {nextStep?.description ??
                      "The initial setup sequence is complete. Use the workspace below for ongoing organization and sharing."}
                  </p>
                </div>
                <InfoPopover label="More about the guided flow" align="left">
                  <p>
                    Setup now focuses on one next step at a time. Assignment, progress review, and
                    diagnostics live below as secondary workflows.
                  </p>
                </InfoPopover>
              </div>
            </div>

            <SetupActionSurface
              activeStep={activeStep}
              canAssignTickets={canAssignTickets}
              canLaunchSetup={canLaunchSetup}
              onContinue={handleContinueSetup}
              project={project}
              setupActionLabel={setupActionLabel}
            />
          </Card>

        </div>
      </div>

      <Card className="h-fit space-y-6 p-6">
        <div className="space-y-1">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            <Route className="h-3.5 w-3.5" strokeWidth={2} />
            Setup rail
          </p>
          <h2 className="text-2xl font-semibold">Move through the first-share sequence</h2>
          <p className="text-sm text-[var(--foreground-muted)]">
            The documented order stays visible below the overview, with the current step called out
            more strongly than the rest.
          </p>
        </div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
          {checklist.map((step, index) => (
            <CompactChecklistCard
              key={step.id}
              index={index + 1}
              isActive={step.id === activeStepId}
              onOpen={
                step.id === activeStepId && canLaunchSetup && step.id !== "assign-tickets"
                  ? () => setIsSetupModalOpen(true)
                  : undefined
              }
              state={step.state}
              title={step.title}
            />
          ))}
        </div>
      </Card>

      <Card className="h-fit space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
              Secondary workspace
            </p>
            <h2 className="text-2xl font-semibold">Open the lower-priority project tools when needed</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Assignment stays behind a workspace area, while progress, sync diagnostics, and client
              sharing sit in their own lower-priority view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <WorkspaceTabButton
              active={workspaceTab === "organization"}
              label="Work organization"
              onClick={() => setWorkspaceTab("organization")}
            />
            <WorkspaceTabButton
              active={workspaceTab === "health"}
              label="Sharing and health"
              onClick={() => setWorkspaceTab("health")}
            />
          </div>
        </div>

        {workspaceTab === "organization" ? (
          <div className="space-y-6">
            <FeatureManagementPanel project={project} />
            <ProjectWorkspaceHandoff
              description="Ticket review and assignment now live in the dedicated tickets workspace so this page can stay focused on setup and readiness."
              href={`/tickets?projectId=${project.id}`}
              title="Open the tickets workspace"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ProgressAndSyncLogsPanel project={project} />
            <ClientAccessPanel project={project} />
          </div>
        )}
      </Card>

      <div className="text-sm text-[var(--foreground-muted)]">
        <Link className="font-semibold text-[var(--primary)]" href="/projects">
          Back to all projects
        </Link>
      </div>

      <Modal
        className={getSetupModalClassName(activeStepId)}
        description={getSetupModalDescription(activeStepId)}
        onClose={() => setIsSetupModalOpen(false)}
        open={isSetupModalOpen && canLaunchSetup}
        title={getSetupModalTitle(activeStep)}
      >
        <GuidedSetupContent activeStepId={activeStepId} project={project} />
      </Modal>

      <Modal
        description="Keep the client-facing basics accurate here. Sync interval stays within the documented 5-60 minute window."
        onClose={() => setIsEditing(false)}
        open={canEditProject && isEditing}
        title="Edit project metadata"
      >
        <ProjectEditCard
          error={updateProjectMutation.error}
          errors={errors}
          isError={updateProjectMutation.isError}
          isPending={updateProjectMutation.isPending}
          isSubmitting={isSubmitting}
          onCancel={() => setIsEditing(false)}
          onSubmit={handleUpdateProject}
          register={register}
        />
      </Modal>
    </div>
  );
}

function SetupActionSurface({
  project,
  activeStep,
  canLaunchSetup,
  canAssignTickets,
  setupActionLabel,
  onContinue,
}: {
  project: Project;
  activeStep: ProjectChecklistStep | null;
  canLaunchSetup: boolean;
  canAssignTickets: boolean;
  setupActionLabel: string;
  onContinue: () => void;
}) {
  if (!activeStep) {
    return (
      <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Initial setup is staged</h3>
          <p className="text-sm text-[var(--foreground-muted)]">
            Use the workspace below for ticket organization, progress review, sync diagnostics, and
            client sharing.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            href={`/tickets?projectId=${project.id}`}
          >
            Open tickets workspace
          </Link>
          <p className="self-center text-sm text-[var(--foreground-muted)]">
            Sharing and health stay available in the lower workspace area.
          </p>
        </div>
      </div>
    );
  }

  const readOnlyMessage =
    activeStep.id === "assign-tickets"
      ? "Assignment is available only to Team Leaders and Business Analysts in the workspace below."
      : "Your role can review setup status here, but this step must be completed by an authorized teammate.";

  return (
    <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-foreground)]">
          Current step
        </span>
        <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
          {activeStep.title}
        </span>
      </div>

      <p className="text-sm text-[var(--foreground-muted)]">{activeStep.description}</p>

      <ProjectSetupStatusGrid project={project} />

      {activeStep.id === "assign-tickets" ? (
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            href={`/tickets?projectId=${project.id}`}
          >
            {setupActionLabel}
          </Link>
          {!canAssignTickets ? (
            <p className="self-center text-sm text-[var(--foreground-muted)]">{readOnlyMessage}</p>
          ) : null}
        </div>
      ) : canLaunchSetup ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={onContinue} type="button">
            {setupActionLabel}
          </Button>
          <Link
            className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            href={`/tickets?projectId=${project.id}`}
          >
            Open tickets workspace
          </Link>
        </div>
      ) : (
        <p className="text-sm text-[var(--foreground-muted)]">{readOnlyMessage}</p>
      )}
    </div>
  );
}

function ProjectSetupStatusGrid({ project }: { project: Project }) {
  const items = [
    {
      label: "Notion connection",
      value: project.notionDatabaseId ? "Connected" : "Pending",
    },
    {
      label: "Status mapping",
      value:
        project.statusMapping && Object.keys(project.statusMapping).length ? "Saved" : "Pending",
    },
    {
      label: "First sync",
      value: project.lastSyncedAt ? "Recorded" : "Pending",
    },
    {
      label: "Feature groups",
      value: project.features.length ? `${project.features.length} created` : "Pending",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            {item.label}
          </div>
          <div className="mt-2 text-sm font-medium">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function WorkspaceTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition duration-200 ${
        active
          ? "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)] shadow-[var(--shadow-sm)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--primary)_24%,var(--border))] hover:text-[var(--foreground)] hover:shadow-[var(--shadow-sm)]"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function CompactChecklistCard({
  index,
  title,
  state,
  isActive,
  onOpen,
}: {
  index: number;
  title: string;
  state: "complete" | "current" | "upcoming";
  isActive: boolean;
  onOpen?: () => void;
}) {
  const stateLabel = {
    complete: "Complete",
    current: "Current",
    upcoming: "Upcoming",
  }[state];

  const stateClasses = {
    complete:
      "border-[color:color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_10%,var(--surface))]",
    current:
      "border-[color:color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))]",
    upcoming: "border-[var(--border)] bg-[var(--surface)]",
  };

  return (
    <div
      className={`rounded-[var(--radius-lg)] border p-4 ${
        isActive ? "md:col-span-2 xl:col-span-2" : ""
      } ${stateClasses[state]} transition duration-200 ${
        isActive
          ? "shadow-[var(--shadow-sm)]"
          : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]"
      }`}
    >
      <div className="flex h-full min-h-32 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
              Step {index}
            </div>
            <div className="mt-1 text-base font-semibold leading-snug text-balance">{title}</div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
            {stateLabel}
          </span>
        </div>

        {isActive && onOpen ? (
          <div className="mt-auto flex justify-start">
            <Button onClick={onOpen} type="button" variant="secondary">
              Open current step
            </Button>
          </div>
        ) : (
          <div aria-hidden="true" className="h-10" />
        )}
      </div>
    </div>
  );
}

function HeaderSyncSignal({
  freshness,
  lastSyncedAt,
}: {
  freshness: ReturnType<typeof getSyncFreshness>;
  lastSyncedAt: string | null;
}) {
  const toneStyles = {
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    neutral: "bg-[var(--neutral)]",
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 transition duration-200 hover:border-[color:color-mix(in_srgb,var(--primary)_24%,var(--border))] hover:shadow-[var(--shadow-sm)]">
      <span
        aria-hidden="true"
        className={`h-2.5 w-2.5 flex-none rounded-full ${toneStyles[freshness.tone]}`}
      />
      <span className="inline-flex min-h-7 items-center rounded-full border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_88%,var(--background))] px-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
        {freshness.label}
      </span>
      <InfoPopover label="More about sync signal" align="left" className="shrink-0">
        <p>{freshness.detail}</p>
        <p className="mt-2">
          {lastSyncedAt
            ? `Latest sync: ${formatDateTime(lastSyncedAt)}.`
            : "No sync has been recorded yet."}
        </p>
      </InfoPopover>
    </div>
  );
}

function GuidedSetupContent({
  activeStepId,
  project,
}: {
  activeStepId: SetupStepId | null;
  project: Project;
}) {
  if (!activeStepId) {
    return (
      <EmptyState
        title="No active setup step"
        description="The initial setup flow is complete. Use the lower workspace area for ongoing project operations."
      />
    );
  }

  if (activeStepId === "connect-notion" || activeStepId === "save-mapping") {
    return <NotionIntegrationPanel project={project} />;
  }

  if (activeStepId === "run-sync") {
    return <SyncPanel project={project} />;
  }

  if (activeStepId === "create-features") {
    return <FeatureManagementPanel project={project} />;
  }

  if (activeStepId === "share-client-link") {
    return <ClientAccessPanel project={project} />;
  }

  return (
    <EmptyState
      title="Assignment lives in the workspace"
      description="Ticket assignment has been moved behind the secondary workspace area so the main setup flow stays lighter."
    />
  );
}

function ProjectWorkspaceHandoff({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="space-y-4 p-6 transition duration-200 hover:shadow-[var(--shadow-sm)]">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          Dedicated workspace
        </p>
        <h3 className="text-xl font-semibold text-balance">{title}</h3>
        <p className="text-sm leading-6 text-[var(--foreground-muted)]">{description}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold !text-white visited:!text-white hover:!text-white shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:opacity-95 hover:shadow-[var(--shadow-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          href={href}
        >
          Open tickets workspace
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition duration-200 hover:-translate-y-0.5 hover:bg-[var(--surface-muted)] hover:shadow-[var(--shadow-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          href="/tickets"
        >
          Browse all projects
        </Link>
      </div>
    </Card>
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
        {errors.clientName ? <p className="text-sm text-[var(--danger)]">{errors.clientName.message}</p> : null}
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

      <div className="flex flex-wrap justify-end gap-3">
        <Button disabled={isSubmitting || isPending} type="submit">
          {isSubmitting || isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button onClick={onCancel} type="button" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}

function ProjectMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        <Gauge className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
      </div>
      <div className="mt-2 text-sm font-medium leading-6">{value}</div>
    </div>
  );
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        <ClipboardList className="h-3.5 w-3.5" strokeWidth={2} />
        {label}
      </div>
      <div className="break-words text-sm font-medium leading-6">{value}</div>
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
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="h-[28rem] animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          <div className="h-56 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
          <div className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        </div>
      </div>
      <div className="h-[24rem] animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
    </div>
  );
}

function getActiveStepId(checklist: ProjectChecklistStep[]): SetupStepId | null {
  const currentStep = checklist.find((step) => step.state === "current");
  if (currentStep) {
    return currentStep.id as SetupStepId;
  }

  const allComplete = checklist.length > 0 && checklist.every((step) => step.state === "complete");
  return allComplete ? null : "share-client-link";
}

function getSetupActionLabel(
  activeStepId: SetupStepId | null,
  canLaunchSetup: boolean,
  canAssignTickets: boolean,
) {
  if (!activeStepId) {
    return "Open workspace";
  }

  if (activeStepId === "assign-tickets") {
    return canAssignTickets ? "Open assignment workspace" : "Review assignment workspace";
  }

  if (!canLaunchSetup) {
    return "Review status";
  }

  const labels: Record<Exclude<SetupStepId, "assign-tickets">, string> = {
    "connect-notion": "Continue Notion setup",
    "save-mapping": "Open mapping step",
    "run-sync": "Open sync step",
    "create-features": "Create first feature",
    "share-client-link": "Open share step",
  };

  return labels[activeStepId];
}

function getSetupModalTitle(activeStep: ProjectChecklistStep | null) {
  if (!activeStep) {
    return "Project setup";
  }

  return activeStep.title;
}

function getSetupModalDescription(activeStepId: SetupStepId | null) {
  if (!activeStepId) {
    return "The current setup step appears here so the page can stay focused and shorter.";
  }

  const descriptions: Record<SetupStepId, string> = {
    "connect-notion":
      "Handle the current setup task in a focused surface, then return to the main page with less scrolling.",
    "save-mapping":
      "Handle the current setup task in a focused surface, then return to the main page with less scrolling.",
    "run-sync":
      "Run the first sync from a dedicated step view without expanding the full page.",
    "create-features":
      "Create the first client-facing feature without leaving the setup sequence.",
    "assign-tickets":
      "Assignment now lives in the lower workspace so the setup path stays lighter.",
    "share-client-link":
      "Retrieve the client-safe sharing link from a focused view once the project is ready.",
  };

  return descriptions[activeStepId];
}

function getSetupModalClassName(activeStepId: SetupStepId | null) {
  if (activeStepId === "connect-notion" || activeStepId === "save-mapping") {
    return "max-w-4xl";
  }

  if (activeStepId === "run-sync" || activeStepId === "create-features") {
    return "max-w-3xl";
  }

  if (activeStepId === "share-client-link") {
    return "max-w-3xl";
  }

  return "max-w-3xl";
}
