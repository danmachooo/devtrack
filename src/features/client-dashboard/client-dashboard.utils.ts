import { getSyncFreshness } from "@/features/projects/project-utils";
import type { FeatureProgressStatus, SyncLogStatus } from "@/types/api";

export function getClientFeatureTone(status: FeatureProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "success" as const;
    case "IN_PROGRESS":
      return "warning" as const;
    case "NOT_STARTED":
      return "neutral" as const;
    case "NO_WORK_LOGGED":
      return "neutral" as const;
  }
}

export function getClientFeatureLabel(status: FeatureProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "IN_PROGRESS":
      return "In progress";
    case "NOT_STARTED":
      return "Not started";
    case "NO_WORK_LOGGED":
      return "No work logged";
  }
}

export function getActivityTone(status: SyncLogStatus) {
  switch (status) {
    case "SUCCESS":
      return "success" as const;
    case "FAILED":
      return "danger" as const;
    case "RATE_LIMITED":
      return "warning" as const;
  }
}

export function getClientFreshness(lastSyncedAt: string | null) {
  return getSyncFreshness(lastSyncedAt);
}
