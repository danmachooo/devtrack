import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  FolderTree,
  PencilLine,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type {
  FeatureProgressSnapshot,
  FeatureWorkspaceStatus,
} from "@/features/features-management/feature-management.utils";
import { getFeatureWorkspaceStatus } from "@/features/features-management/feature-management.utils";
import {
  updateFeatureSchema,
  type UpdateFeatureFormValues,
} from "@/features/features-management/feature.schemas";
import type { ProjectFeatureSummary } from "@/types/api";

type FeatureDetailPaneProps = {
  feature: ProjectFeatureSummary;
  totalFeatures: number;
  canManageFeatures: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  progressSummary?: FeatureProgressSnapshot;
  onSaveName: (name: string) => void;
  onMoveToTop: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveToBottom: () => void;
  onMoveToPosition: (order: number) => void;
  onDelete: () => void;
};

export function FeatureDetailPane({
  feature,
  totalFeatures,
  canManageFeatures,
  isSaving,
  isDeleting,
  progressSummary,
  onSaveName,
  onMoveToTop,
  onMoveUp,
  onMoveDown,
  onMoveToBottom,
  onMoveToPosition,
  onDelete,
}: FeatureDetailPaneProps) {
  const [activeTab, setActiveTab] = useState<"details" | "order">("details");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateFeatureFormValues>({
    resolver: zodResolver(updateFeatureSchema),
    defaultValues: {
      name: feature.name,
    },
  });

  useEffect(() => {
    reset({ name: feature.name });
  }, [feature.name, reset]);

  useEffect(() => {
    setActiveTab("details");
  }, [feature.id]);

  const progress = progressSummary?.progress ?? 0;
  const totalTickets = progressSummary?.totalTickets ?? 0;
  const completedTickets = progressSummary?.completedTickets ?? 0;
  const status = getFeatureWorkspaceStatus(progressSummary);

  const onSubmit = handleSubmit((values) => {
    onSaveName(values.name);
  });

  return (
    <div className="space-y-5 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--background)_100%)] p-6 shadow-[var(--shadow-sm)]">
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          <FolderTree className="h-3.5 w-3.5" strokeWidth={2} />
          Feature editor
        </p>
        <div className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <FeatureStatusPill status={status} />
              <span className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                Order {feature.order + 1} of {totalFeatures}
              </span>
            </div>
            {canManageFeatures ? (
              <Button
                aria-label={`Delete feature ${feature.name}`}
                disabled={isSaving || isDeleting}
                onClick={onDelete}
                title="Delete feature"
                type="button"
                variant="ghost"
                className="h-10 w-10 rounded-full border border-[color:color-mix(in_srgb,var(--danger)_22%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_8%,var(--surface))] p-0 text-[var(--danger)] hover:bg-[color:color-mix(in_srgb,var(--danger)_12%,var(--surface))]"
              >
                <Trash2 className="h-4 w-4" strokeWidth={2} />
              </Button>
            ) : null}
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-balance">{feature.name}</h3>
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">
            Refine this feature so it reads clearly in the client-facing progress story and stays in the right narrative order.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <EditorMetric
          label="Linked tickets"
          value={`${feature._count.tickets}`}
          detail="All synced tickets currently linked to this feature."
        />
        <EditorMetric
          label="Assigned progress"
          value={`${progress}%`}
          detail={
            totalTickets > 0
              ? `${completedTickets} of ${totalTickets} assigned ticket${totalTickets === 1 ? "" : "s"} complete`
              : "No assigned tickets contributing yet"
          }
        />
        <EditorMetric
          label="Editor focus"
          value={status === "completed" ? "Healthy" : status === "active" ? "In motion" : "Needs grouping"}
          detail="Use the list and tickets workspace together to keep this feature meaningful."
        />
      </div>

      <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Progress snapshot</h4>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Progress comes from assigned, non-missing tickets only.
            </p>
          </div>
          <span className="text-lg font-semibold">{progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <EditorTabButton
          active={activeTab === "details"}
          label="Details"
          onClick={() => setActiveTab("details")}
        />
        <EditorTabButton
          active={activeTab === "order"}
          label="Order"
          onClick={() => setActiveTab("order")}
        />
      </div>

      {activeTab === "details" ? (
        <form className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <PencilLine className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Rename feature
            </p>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Use client-facing language that sounds like a real deliverable, not a team bucket.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor={`feature-editor-name-${feature.id}`}>
              Feature name
            </label>
            <Input
              disabled={!canManageFeatures || isSaving || isDeleting}
              id={`feature-editor-name-${feature.id}`}
              placeholder="Client portal"
              {...register("name")}
            />
            {errors.name ? <p className="text-sm text-[var(--danger)]">{errors.name.message}</p> : null}
          </div>

          {canManageFeatures ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button disabled={!isDirty || isSaving || isDeleting} type="submit">
                {isSaving ? "Saving..." : "Save name"}
              </Button>
            </div>
          ) : null}
        </form>
      ) : (
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
          <div className="space-y-1.5">
            <h4 className="text-sm font-semibold">Ordering controls</h4>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Keep higher-level deliverables near the top so the client-facing narrative flows naturally.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              disabled={!canManageFeatures || feature.order === 0 || isSaving || isDeleting}
              onClick={onMoveToTop}
              type="button"
              variant="secondary"
            >
              <ChevronsUp className="h-4 w-4" strokeWidth={2} />
              Move to top
            </Button>
            <Button
              disabled={!canManageFeatures || feature.order === 0 || isSaving || isDeleting}
              onClick={onMoveUp}
              type="button"
              variant="secondary"
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2} />
              Move up
            </Button>
            <Button
              disabled={!canManageFeatures || feature.order === totalFeatures - 1 || isSaving || isDeleting}
              onClick={onMoveDown}
              type="button"
              variant="secondary"
            >
              <ArrowDown className="h-4 w-4" strokeWidth={2} />
              Move down
            </Button>
            <Button
              disabled={!canManageFeatures || feature.order === totalFeatures - 1 || isSaving || isDeleting}
              onClick={onMoveToBottom}
              type="button"
              variant="secondary"
            >
              <ChevronsDown className="h-4 w-4" strokeWidth={2} />
              Move to bottom
            </Button>
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="text-sm font-medium" htmlFor={`feature-order-position-${feature.id}`}>
              Move directly to position
            </label>
            <Select
              disabled={!canManageFeatures || isSaving || isDeleting}
              id={`feature-order-position-${feature.id}`}
              onChange={(event) => onMoveToPosition(Number(event.target.value))}
              value={String(feature.order)}
            >
              {Array.from({ length: totalFeatures }).map((_, index) => (
                <option key={index} value={index}>
                  Position {index + 1}
                </option>
              ))}
            </Select>
            <p className="text-sm leading-6 text-[var(--foreground-muted)]">
              Use this when the feature needs to jump further in the client narrative without repeated step moves.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EditorMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">{label}</p>
      <div className="mt-3 text-2xl font-semibold leading-none tracking-tight">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{detail}</p>
    </div>
  );
}

function FeatureStatusPill({ status }: { status: FeatureWorkspaceStatus }) {
  const toneClasses =
    status === "completed"
      ? "border-[color:color-mix(in_srgb,var(--success)_36%,var(--border))] bg-[color:color-mix(in_srgb,var(--success)_12%,transparent)] text-[var(--success)]"
      : status === "active"
        ? "border-[color:color-mix(in_srgb,var(--warning)_36%,var(--border))] bg-[color:color-mix(in_srgb,var(--warning)_12%,transparent)] text-[var(--warning)]"
        : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground-muted)]";

  const label = status === "completed" ? "Completed" : status === "active" ? "Active" : "No assigned work";

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses}`}>
      {label}
    </span>
  );
}

function EditorTabButton({
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
