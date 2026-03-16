import type { SyncLogStatus } from "@/types/api";

export function getSyncMessage(status: SyncLogStatus) {
  switch (status) {
    case "SUCCESS":
      return "Project data synced successfully.";
    case "FAILED":
      return "The sync failed and needs attention.";
    case "RATE_LIMITED":
      return "The sync was rate limited by the source.";
  }
}
