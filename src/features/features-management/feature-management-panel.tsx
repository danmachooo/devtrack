"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { FolderTree, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FeatureDetailPane } from "@/features/features-management/components/feature-detail-pane";
import { DeleteFeatureDialog } from "@/features/features-management/components/delete-feature-dialog";
import { FeatureEmptyEditor } from "@/features/features-management/components/feature-empty-editor";
import { FeatureListPane } from "@/features/features-management/components/feature-list-pane";
import {
  filterFeaturesForWorkspace,
  type FeatureWorkspaceFilter,
} from "@/features/features-management/feature-management.utils";
import {
  createFeatureSchema,
  type CreateFeatureFormValues,
} from "@/features/features-management/feature.schemas";
import { useFeatureManagement } from "@/features/features-management/use-feature-management";
import { buildFeatureProgressSummaries } from "@/features/progress/progress-utils";
import { useSession } from "@/hooks/use-session";
import { getProjectTickets } from "@/lib/api/tickets.api";
import { canPerformAction } from "@/lib/auth/permissions";
import type { Project } from "@/types/api";

type FeatureManagementPanelProps = {
  project: Project;
};

export function FeatureManagementPanel({ project }: FeatureManagementPanelProps) {
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canManageFeatures = canPerformAction(role, "manageFeatures");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FeatureWorkspaceFilter>("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    features,
    featuresQuery,
    selectedFeature,
    selectedFeatureId,
    updateFeatureMutation,
  } = useFeatureManagement(project.id, () => {
    reset();
    setIsCreateModalOpen(false);
  });

  const ticketsQuery = useQuery({
    queryKey: ["project", project.id, "tickets", { showMissing: true }, "feature-management"],
    queryFn: () => getProjectTickets(project.id, { showMissing: true, limit: 100 }),
    enabled: features.length > 0,
  });

  const featureProgress = buildFeatureProgressSummaries(features, ticketsQuery.data?.data.items ?? []);
  const featureProgressById = useMemo(
    () => new Map(featureProgress.map((item) => [item.featureId, item])),
    [featureProgress],
  );

  const visibleFeatures = useMemo(
    () => filterFeaturesForWorkspace(features, searchTerm, activeFilter, featureProgressById),
    [activeFilter, featureProgressById, features, searchTerm],
  );

  const effectiveSelectedFeature =
    visibleFeatures.find((feature) => feature.id === selectedFeatureId) ?? selectedFeature ?? visibleFeatures[0] ?? null;

  const onSubmit = handleSubmit((values) => {
    actions.createFeature(values);
  });

  return (
    <Card className="space-y-6 border-[color:color-mix(in_srgb,var(--primary)_12%,var(--border))] bg-[linear-gradient(180deg,var(--surface)_0%,var(--background)_100%)] p-6">
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          <FolderTree className="h-3.5 w-3.5" strokeWidth={2} />
          Feature management
        </p>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-balance">Turn work into a client story</h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--foreground-muted)]">
              Curate client-facing feature groups in a focused editor so naming, ordering, and progress all stay intentional as the project grows.
            </p>
          </div>

          {canManageFeatures ? (
            <Button onClick={() => setIsCreateModalOpen(true)} type="button">
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add feature
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_7%,var(--surface))_0%,var(--surface)_100%)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] text-[var(--primary)]">
            <Sparkles className="h-5 w-5" strokeWidth={2} />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Editorial guidance</h3>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Features should read like client-recognizable deliverables. Prefer names such as
              “Client Portal”, “Reporting Dashboard”, or “Billing Rollout” over internal team names
              or technical layers.
            </p>
          </div>
        </div>
      </div>

      {createFeatureMutation.isError ? (
        <p className="text-sm text-[var(--danger)]">
          {createFeatureMutation.error instanceof Error
            ? createFeatureMutation.error.message
            : "Feature creation failed. Try again."}
        </p>
      ) : null}

      {featuresQuery.isPending ? (
        <FeatureWorkspaceSkeleton />
      ) : !features.length ? (
        <div className="grid gap-5 xl:grid-cols-[1.05fr_1.25fr]">
          <EmptyState
            title="No feature groups yet"
            description={
              canManageFeatures
                ? "Create the first feature so synced work can be grouped into something a client can actually follow."
                : "No feature groups have been created yet. Team Leaders and Business Analysts can add them here."
            }
          />
          <FeatureEmptyEditor canManageFeatures={canManageFeatures} hasFeatures={false} />
        </div>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <FeatureListPane
            activeFilter={activeFilter}
            features={visibleFeatures}
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchTerm}
            onSelectFeature={actions.selectFeature}
            progressByFeatureId={featureProgressById}
            searchTerm={searchTerm}
            selectedFeatureId={effectiveSelectedFeature?.id ?? null}
            totalFeatureCount={features.length}
          />

          {effectiveSelectedFeature ? (
            <FeatureDetailPane
              canManageFeatures={canManageFeatures}
              feature={effectiveSelectedFeature}
              isDeleting={deleteFeatureMutation.isPending && deleteFeatureMutation.variables === effectiveSelectedFeature.id}
              isSaving={updateFeatureMutation.isPending && updateFeatureMutation.variables?.id === effectiveSelectedFeature.id}
              onDelete={() => setIsDeleteDialogOpen(true)}
              onMoveDown={() =>
                actions.moveFeature(
                  effectiveSelectedFeature.id,
                  Math.min(effectiveSelectedFeature.order + 1, features.length - 1),
                )
              }
              onMoveToPosition={(order) => actions.moveFeature(effectiveSelectedFeature.id, order)}
              onMoveToBottom={() => actions.moveFeature(effectiveSelectedFeature.id, features.length - 1)}
              onMoveToTop={() => actions.moveFeature(effectiveSelectedFeature.id, 0)}
              onMoveUp={() => actions.moveFeature(effectiveSelectedFeature.id, Math.max(effectiveSelectedFeature.order - 1, 0))}
              onSaveName={(name) => actions.renameFeature(effectiveSelectedFeature.id, name)}
              progressSummary={featureProgressById.get(effectiveSelectedFeature.id)}
              totalFeatures={features.length}
            />
          ) : (
            <FeatureEmptyEditor canManageFeatures={canManageFeatures} hasFeatures />
          )}
        </div>
      )}

      <Modal
        description="Feature names should read well in front of a client and clearly describe a deliverable."
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
            {errors.name ? <p className="text-sm text-[var(--danger)]">{errors.name.message}</p> : null}
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Use a client-facing deliverable name rather than an internal team bucket or technical layer.
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => setIsCreateModalOpen(false)} type="button" variant="secondary">
              Cancel
            </Button>
            <Button disabled={isSubmitting || createFeatureMutation.isPending} type="submit">
              {isSubmitting || createFeatureMutation.isPending ? "Adding..." : "Add feature"}
            </Button>
          </div>
        </form>
      </Modal>

      <DeleteFeatureDialog
        feature={effectiveSelectedFeature}
        isDeleting={
          Boolean(
            effectiveSelectedFeature &&
              deleteFeatureMutation.isPending &&
              deleteFeatureMutation.variables === effectiveSelectedFeature.id,
          )
        }
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (!effectiveSelectedFeature) {
            return;
          }

          actions.deleteFeature(effectiveSelectedFeature.id);
          setIsDeleteDialogOpen(false);
        }}
        open={isDeleteDialogOpen && Boolean(effectiveSelectedFeature)}
      />
    </Card>
  );
}

function FeatureWorkspaceSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="h-24 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      </div>
      <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="h-8 w-56 animate-pulse rounded bg-[var(--surface-muted)]" />
        <div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="h-40 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
        <div className="h-28 animate-pulse rounded-[var(--radius-lg)] bg-[var(--surface-muted)]" />
      </div>
    </div>
  );
}
