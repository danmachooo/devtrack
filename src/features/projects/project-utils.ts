import type { Project } from "@/types/api";

export type ChecklistStepState = "complete" | "current" | "upcoming";

export type ProjectChecklistStep = {
  id: string;
  title: string;
  description: string;
  state: ChecklistStepState;
};

function hasStatusMapping(project: Project) {
  return Boolean(project.statusMapping && Object.keys(project.statusMapping).length > 0);
}

function hasSyncedTickets(project: Project) {
  return Boolean(project.lastSyncedAt && project._count.tickets > 0);
}

function hasFeatureGroups(project: Project) {
  return project.features.length > 0;
}

function hasReviewableAssignmentState(project: Project) {
  return hasSyncedTickets(project) && hasFeatureGroups(project);
}

export function getProjectProgress(project: Project) {
  const completedSignals = [
    Boolean(project.notionDatabaseId),
    hasStatusMapping(project),
    Boolean(project.lastSyncedAt),
    hasFeatureGroups(project),
  ].filter(Boolean).length;

  return Math.round((completedSignals / 4) * 100);
}

export function getNextProjectStep(project: Project) {
  if (!project.notionDatabaseId) {
    return {
      title: "Connect Notion",
      description:
        "Verify the Notion token and database first so DevTrack can start reading delivery work safely.",
    };
  }

  if (!hasStatusMapping(project)) {
    return {
      title: "Save status mapping",
      description:
        "Teach DevTrack which source statuses count as not started, in development, approved, and released.",
    };
  }

  if (!project.lastSyncedAt) {
    return {
      title: "Run first sync",
      description:
        "Bring tickets into DevTrack so the project stops feeling like setup and starts feeling operational.",
    };
  }

  if (!hasFeatureGroups(project)) {
    return {
      title: "Create feature groups",
      description:
        "Turn raw synced work into client-facing feature buckets that can anchor progress and storytelling.",
    };
  }

  if (!hasReviewableAssignmentState(project)) {
    return {
      title: "Review ticket assignment readiness",
      description:
        "Make sure synced tickets and feature groups are both in place before ticket assignment begins.",
    };
  }

  return {
    title: "Prepare client sharing",
    description:
      "The command center is staged. Next, review assignments and retrieve the client access link when sharing is ready.",
  };
}

export function getProjectChecklist(project: Project): ProjectChecklistStep[] {
  const states: ChecklistStepState[] = [];
  const completions = [
    Boolean(project.notionDatabaseId),
    hasStatusMapping(project),
    Boolean(project.lastSyncedAt),
    hasFeatureGroups(project),
    hasReviewableAssignmentState(project),
    false,
  ];

  let currentAssigned = false;

  for (const isComplete of completions) {
    if (isComplete) {
      states.push("complete");
      continue;
    }

    if (!currentAssigned) {
      states.push("current");
      currentAssigned = true;
      continue;
    }

    states.push("upcoming");
  }

  return [
    {
      id: "connect-notion",
      title: "Connect Notion",
      description: "Attach the source database so DevTrack can read ticket activity.",
      state: states[0],
    },
    {
      id: "save-mapping",
      title: "Save status mapping",
      description: "Map source statuses into DevTrack completion logic.",
      state: states[1],
    },
    {
      id: "run-sync",
      title: "Run first sync",
      description: "Pull tickets into the workspace and establish freshness.",
      state: states[2],
    },
    {
      id: "create-features",
      title: "Create client-facing features",
      description: "Group work into the deliverables clients can understand.",
      state: states[3],
    },
    {
      id: "assign-tickets",
      title: "Assign tickets",
      description: "Connect synced work to the right feature buckets.",
      state: states[4],
    },
    {
      id: "share-client-link",
      title: "Share client link",
      description: "Retrieve the client-safe dashboard link when the story is ready.",
      state: states[5],
    },
  ];
}

export function getSyncFreshness(lastSyncedAt: string | null) {
  if (!lastSyncedAt) {
    return {
      tone: "neutral" as const,
      label: "Not synced",
      detail: "No sync has been recorded yet.",
    };
  }

  const elapsedHours = (Date.now() - new Date(lastSyncedAt).getTime()) / (1000 * 60 * 60);

  if (elapsedHours <= 24) {
    return {
      tone: "success" as const,
      label: "Fresh sync",
      detail: "Project data has been refreshed within the last day.",
    };
  }

  if (elapsedHours <= 72) {
    return {
      tone: "warning" as const,
      label: "Aging sync",
      detail: "The team should check whether a new sync is needed soon.",
    };
  }

  return {
    tone: "danger" as const,
    label: "Stale sync",
    detail: "Data may no longer reflect the current project state.",
  };
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
