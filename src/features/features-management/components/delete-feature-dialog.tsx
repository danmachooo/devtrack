import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ProjectFeatureSummary } from "@/types/api";

type DeleteFeatureDialogProps = {
  feature: ProjectFeatureSummary | null;
  isDeleting: boolean;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteFeatureDialog({
  feature,
  isDeleting,
  open,
  onClose,
  onConfirm,
}: DeleteFeatureDialogProps) {
  if (!feature) {
    return null;
  }

  return (
    <Modal
      description="Deleting a feature is permanent and clears related ticket assignments so those tickets return to an unassigned state."
      onClose={onClose}
      open={open}
      title={`Delete ${feature.name}?`}
    >
      <div className="space-y-5">
        <div className="rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--danger)_24%,var(--border))] bg-[color:color-mix(in_srgb,var(--danger)_10%,var(--surface))] p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" strokeWidth={2} />
            <div className="space-y-2 text-sm leading-6 text-[var(--foreground-muted)]">
              <p className="font-medium text-[var(--foreground)]">This will affect ticket grouping.</p>
              <p>
                Any tickets currently assigned to <span className="font-semibold text-[var(--foreground)]">{feature.name}</span> will be cleared and will need to be mapped again from the tickets workspace.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <Button disabled={isDeleting} onClick={onClose} type="button" variant="secondary">
            Cancel
          </Button>
          <Button disabled={isDeleting} onClick={onConfirm} type="button">
            {isDeleting ? "Deleting..." : "Delete feature"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
