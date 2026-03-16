"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import {
  createFeature,
  deleteFeature,
  getProjectFeatures,
  updateFeature,
} from "@/lib/api/features.api";
import {
  createFeatureSchema,
  updateFeatureSchema,
  type CreateFeatureFormValues,
  type UpdateFeatureFormValues,
} from "@/features/features-management/feature.schemas";
import type { Project, ProjectFeatureSummary } from "@/types/api";

type FeatureManagementPanelProps = {
  project: Project;
};

export function FeatureManagementPanel({ project }: FeatureManagementPanelProps) {
  const queryClient = useQueryClient();
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canManageFeatures = canPerformAction(role, "manageFeatures");
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);

  const featuresQuery = useQuery({
    queryKey: ["project", project.id, "features"],
    queryFn: () => getProjectFeatures(project.id),
  });

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

  const createFeatureMutation = useMutation({
    mutationFn: (values: CreateFeatureFormValues) => createFeature(project.id, values),
    onSuccess: async () => {
      reset();
      await invalidateFeatureState(queryClient, project.id);
    },
  });

  const updateFeatureMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; order?: number } }) =>
      updateFeature(id, payload),
    onSuccess: async () => {
      startTransition(() => setEditingFeatureId(null));
      await invalidateFeatureState(queryClient, project.id);
    },
  });

  const deleteFeatureMutation = useMutation({
    mutationFn: deleteFeature,
    onSuccess: async () => {
      await invalidateFeatureState(queryClient, project.id);
    },
  });

  const features = featuresQuery.data?.data ?? [];

  const onSubmit = handleSubmit((values) => {
    createFeatureMutation.mutate(values);
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
        <form className="flex flex-col gap-3 md:flex-row md:items-start" onSubmit={onSubmit}>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium" htmlFor="feature-name">
              Add feature
            </label>
            <Input id="feature-name" placeholder="Client portal" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-[var(--danger)]">{errors.name.message}</p>
            ) : (
              <p className="text-sm text-[var(--foreground-muted)]">
                Feature names should read well in front of a client.
              </p>
            )}
          </div>
          <div className="pt-0 md:pt-7">
            <Button disabled={isSubmitting || createFeatureMutation.isPending} type="submit">
              {isSubmitting || createFeatureMutation.isPending ? "Adding..." : "Add feature"}
            </Button>
          </div>
        </form>
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
              isSaving={updateFeatureMutation.isPending && updateFeatureMutation.variables?.id === feature.id}
              onDelete={() => deleteFeatureMutation.mutate(feature.id)}
              onEditToggle={() =>
                setEditingFeatureId((current) => (current === feature.id ? null : feature.id))
              }
              onMoveDown={() =>
                updateFeatureMutation.mutate({
                  id: feature.id,
                  payload: { order: Math.min(index + 1, features.length - 1) },
                })
              }
              onMoveUp={() =>
                updateFeatureMutation.mutate({
                  id: feature.id,
                  payload: { order: Math.max(index - 1, 0) },
                })
              }
              onSaveName={(name) =>
                updateFeatureMutation.mutate({
                  id: feature.id,
                  payload: { name },
                })
              }
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
  onEditToggle: () => void;
  onSaveName: (name: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  const {
    register,
    handleSubmit,
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

  const progress = feature._count.tickets > 0 ? 0 : 0;

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

          {isEditing ? (
            <form className="space-y-3" onSubmit={onSubmit}>
              <Input {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-[var(--danger)]">{errors.name.message}</p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Button disabled={isSaving} type="submit">
                  {isSaving ? "Saving..." : "Save name"}
                </Button>
                <Button onClick={onEditToggle} type="button" variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <h3 className="text-xl font-semibold">{feature.name}</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Progress stays at 0% until ticket assignment lands and gives this feature real contributing work.
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${progress}%` }} />
                </div>
                <div className="text-sm text-[var(--foreground-muted)]">{progress}% progress</div>
              </div>
            </>
          )}
        </div>

        {canManage && !isEditing ? (
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

async function invalidateFeatureState(queryClient: ReturnType<typeof useQueryClient>, projectId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["project", projectId, "features"] }),
    queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
  ]);
}
