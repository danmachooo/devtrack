export type SyncUiState = "idle" | "queued" | "syncing" | "alreadyQueued" | "completed";

export function getSyncCopy(state: SyncUiState, lastSyncedAt: string | null) {
  switch (state) {
    case "queued":
      return {
        title: "Sync queued successfully",
        description:
          "The job is waiting to start. DevTrack keeps this state distinct so users know the request landed.",
      };
    case "syncing":
      return {
        title: "Sync in progress",
        description:
          "The project is actively refreshing source data. Hold here for a moment while the ticket snapshot catches up.",
      };
    case "alreadyQueued":
      return {
        title: "A sync is already queued",
        description:
          "The backend said this project already has a pending manual sync, so DevTrack avoids double-scheduling it.",
      };
    case "completed":
      return {
        title: "Sync completed",
        description: "Fresh project data has been recorded and the relevant project queries were invalidated.",
      };
    default:
      return {
        title: lastSyncedAt ? "Manual sync is available" : "First sync is still waiting",
        description: lastSyncedAt
          ? "Trigger a manual sync whenever the team needs a fresher snapshot from Notion."
          : "Once Notion is connected and statuses are mapped, the first sync brings the project to life.",
      };
  }
}
