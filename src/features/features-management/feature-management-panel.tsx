"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { buildFeatureProgressSummaries } from "@/features/progress/progress-utils";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { getProjectTickets } from "@/lib/api/tickets.api";
import {
  createFeatureSchema,
  updateFeatureSchema,
  type CreateFeatureFormValues,
  type UpdateFeatureFormValues,
} from "@/features/features-management/feature.schemas";
import { useFeatureManagement } from "@/features/features-management/use-feature-management";
import type { Project, ProjectFeatureSummary } from "@/types/api";

type FeatureManagementPanelProps = {
  project: Project;
};

export function FeatureManagementPanel({ project }: FeatureManagementPanelProps) {
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canManageFeatures = canPerformAction(role, "manageFeatures");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFeatureFormValues>({
    resolver: zodResolver(createFeatureSchema),
    defaultValues: {
      name: "",
    },
  });

  const {
    actions,
    createFeatureMutation,
    deleteFeatureMutation,
    editingFeatureId,
    features,
    featuresQuery,
    updateFeatureMutation,
  } = useFeatureManagement(project.id, () => {
    reset();
    setIsCreateModalOpen(false);
  });

  const ticketsQuery = useQuery({
    queryKey: ["project", project.id, "tickets", { showMissing: true }, "feature-management"],
    queryFn: () => getProjectTickets(project.id, { showMissing: true }),
    enabled: features.length > 0,
  });

  const featureProgress = buildFeatureProgressSummaries(features, ticketsQuery.data?.data ?? []);
  const featureProgressById = new Map(featureProgress.map((item) => [item.featureId, item]));

  const onSubmit = handleSubmit((values) => {
    actions.createFeature(values);
  });

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          Feature management
        </p>
        <h2 className="text-2xl font-semibold">Turn work into a client story</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          Create the feature buckets that will eventually organize tickets into a clearer progress narrative.
        </p>
      </div>

      {canManageFeatures ? (
        <div className="flex justify-start">
          <Button onClick={() => setIsCreateModalOpen(true)} type="button">
            Add feature
          </Button>
        </div>
      ) : null}

      {createFeatureMutation.isError ? (
        <p className="text-sm text-[var(--danger)]">
          {createFeatureMutation.error instanceof Error
            ? createFeatureMutation.error.message
            : "Feature creation failed. Try again."}
        </p>
      ) : null}

      {featuresQuery.isPending ? (
        <FeatureListSkeleton />
      ) : features.length ? (
        <div className="space-y-4">
          {features.map((feature, index) => (
            <FeatureRow
              key={feature.id}
              canManage={canManageFeatures}
              feature={feature}
              index={index}
              isDeleting={deleteFeatureMutation.isPending && deleteFeatureMutation.variables === feature.id}
              isEditing={editingFeatureId === feature.id}
              progressSummary={featureProgressById.get(feature.id)}
              isSaving={updateFeatureMutation.isPending && updateFeatureMutation.variables?.id === feature.id}
              onDelete={() => actions.deleteFeature(feature.id)}
              onEditToggle={() => actions.toggleEditingFeature(feature.id)}
              onMoveDown={() =>
                actions.moveFeature(feature.id, Math.min(index + 1, features.length - 1))
              }
              onMoveUp={() =>
                actions.moveFeature(feature.id, Math.max(index - 1, 0))
              }
              onSaveName={(name) => actions.renameFeature(feature.id, name)}
              total={features.length}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No feature groups yet"
          description={
            canManageFeatures
              ? "Create the first feature bucket so synced work can be organized into something client-facing."
              : "No feature groups have been created yet. Team Leaders and Business Analysts can add them here."
          }
        />
      )}

      <Modal
        description="Feature names should read well in front of a client."
        onClose={() => setIsCreateModalOpen(false)}
        open={canManageFeatures && isCreateModalOpen}
        title="Add feature"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="feature-name">
              Feature name
            </label>
            <Input id="feature-name" placeholder="Client portal" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-[var(--danger)]">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSubmitting || createFeatureMutation.isPending} type="submit">
              {isSubmitting || createFeatureMutation.isPending ? "Adding..." : "Add feature"}
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}

function FeatureRow({
  feature,
  index,
  total,
  canManage,
  isEditing,
  isSaving,
  isDeleting,
  progressSummary,
  onEditToggle,
  onSaveName,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  feature: ProjectFeatureSummary;
  index: number;
  total: number;
  canManage: boolean;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  progressSummary?: {
    progress: number;
    totalTickets: number;
    completedTickets: number;
  };
  onEditToggle: () => void;
  onSaveName: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFeatureFormValues>({
    resolver: zodResolver(updateFeatureSchema),
    defaultValues: {
      name: feature.name,
    },
  });

  const onSubmit = handleSubmit((values) => {
    onSaveName(values.name);
  });

  useEffect(() => {
    reset({ name: feature.name });
  }, [feature.name, reset]);

  const progress = progressSummary?.progress ?? 0;
  const totalTickets = progressSummary?.totalTickets ?? 0;
  const completedTickets = progressSummary?.completedTickets ?? 0;

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              Order {index + 1}
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              {feature._count.tickets} tickets
            </span>
          </div>

          <div>
            <h3 className="text-xl font-semibold">{feature.name}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {totalTickets > 0
                ? `${completedTickets} of ${totalTickets} assigned ticket${
                    totalTickets === 1 ? "" : "s"
                  } count toward this feature's progress.`
                : "Progress appears once assigned, non-missing tickets start contributing work to this feature."}
            </p>
          </div>
          <div className="space-y-2">
            <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
              <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-sm text-[var(--foreground-muted)]">{progress}% progress</div>
          </div>
        </div>

        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={index === 0 || isSaving || isDeleting} onClick={onMoveUp} type="button" variant="secondary">
              Move up
            </Button>
            <Button
              disabled={index === total - 1 || isSaving || isDeleting}
              onClick={onMoveDown}
              type="button"
              variant="secondary"
            >
              Move down
            </Button>
            <Button disabled={isSaving || isDeleting} onClick={onEditToggle} type="button" variant="secondary">
              Rename
            </Button>
            <Button disabled={isSaving || isDeleting} onClick={onDelete} type="button" variant="ghost">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        ) : null}
      </div>

      <Modal
        description="Use a name that reads clearly in the client-facing progress story."
        onClose={onEditToggle}
        open={canManage && isEditing}
        title="Rename feature"
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`feature-name-${feature.id}`}>
              Feature name
            </label>
            <Input id={`feature-name-${feature.id}`} {...register("name")} />
            {errors.name ? <p className="text-sm text-[var(--danger)]">{errors.name.message}</p> : null}
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button disabled={isSaving} type="submit">
              {isSaving ? "Saving..." : "Save name"}
            </Button>
            <Button onClick={onEditToggle} type="button" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function FeatureListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]"
        />
      ))}
    </div>
  );
}
