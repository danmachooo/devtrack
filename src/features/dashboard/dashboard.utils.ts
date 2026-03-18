import { formatDateTime, getNextProjectStep, getSyncFreshness } from "@/features/projects/project-utils";
import { canPerformAction } from "@/lib/auth/permissions";
import type { Project, UserRole } from "@/types/api";

type DashboardTone = "success" | "warning" | "danger" | "neutral";

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  tone: DashboardTone;
};

export type DashboardPriority = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
};

export type DashboardProjectHealth = {
  id: string;
  name: string;
  clientName: string;
  clientEmail: string;
  progress: number;
  nextStepTitle: string;
  nextStepDescription: string;
  freshnessLabel: string;
  freshnessTone: DashboardTone;
  lastSyncedLabel: string;
  ticketsLabel: string;
  featuresLabel: string;
  updatedAt: string;
};

function hasStatusMapping(project: Project) {
  return Boolean(project.statusMapping && Object.keys(project.statusMapping).length > 0);
}

function isReadyToShare(project: Project) {
  return Boolean(
    project.notionDatabaseId &&
      hasStatusMapping(project) &&
      project.lastSyncedAt &&
      project.features.length > 0,
  );
}

function needsSetup(project: Project) {
  return !isReadyToShare(project);
}

function needsAttention(project: Project) {
  const freshness = getSyncFreshness(project.lastSyncedAt);
  return !project.lastSyncedAt || freshness.tone === "danger";
}

export function buildDashboardMetrics(projects: Project[]): DashboardMetric[] {
  const readyToShareCount = projects.filter(isReadyToShare).length;
  const setupNeededCount = projects.filter(needsSetup).length;
  const attentionCount = projects.filter(needsAttention).length;

  return [
    {
      label: "Total projects",
      value: String(projects.length),
      detail:
        projects.length > 0
          ? "Active client delivery tracks in this organization."
          : "Create the first project to start the internal delivery loop.",
      tone: projects.length > 0 ? "success" : "neutral",
    },
    {
      label: "Needs setup",
      value: String(setupNeededCount),
      detail:
        setupNeededCount > 0
          ? "Projects still missing one or more setup steps before sharing feels deliberate."
          : "Every project has cleared the core setup milestones.",
      tone: setupNeededCount > 0 ? "warning" : "success",
    },
    {
      label: "Stale or unsynced",
      value: String(attentionCount),
      detail:
        attentionCount > 0
          ? "These projects either need a first sync or have stale delivery data."
          : "All projects look fresh enough to trust at a glance.",
      tone: attentionCount > 0 ? "danger" : "success",
    },
    {
      label: "Ready to share",
      value: String(readyToShareCount),
      detail:
        readyToShareCount > 0
          ? "Projects with enough structure to support deliberate client sharing."
          : "No project is fully staged for sharing yet.",
      tone: readyToShareCount > 0 ? "success" : "neutral",
    },
  ];
}

export function buildDashboardPriorities(projects: Project[], role: UserRole | null | undefined) {
  const priorities: DashboardPriority[] = [];

  if (!projects.length) {
    priorities.push(
      canPerformAction(role, "manageProjects")
        ? {
            id: "create-project",
            title: "Create the first project",
            description:
              "Open a delivery track so Notion setup, sync, feature grouping, and client sharing can begin.",
            ctaLabel: "Create project",
            href: "/projects",
          }
        : {
            id: "review-organization",
            title: "Check workspace readiness",
            description:
              "A team leader needs to create the first project before the delivery workflow becomes operational.",
            ctaLabel: "Open projects",
            href: "/projects",
          },
    );

    if (canPerformAction(role, "manageOrganization")) {
      priorities.push({
        id: "manage-organization",
        title: "Keep the workspace team-ready",
        description: "Invite teammates and confirm the right roles before delivery work starts moving.",
        ctaLabel: "Manage organization",
        href: "/organization",
      });
    }

    return priorities;
  }

  const firstProjectWithoutNotion = projects.find((project) => !project.notionDatabaseId);
  if (firstProjectWithoutNotion && canPerformAction(role, "manageNotion")) {
    priorities.push({
      id: "connect-notion",
      title: "Connect Notion for the next project",
      description:
        "At least one project still needs its source database connected before DevTrack can read delivery work.",
      ctaLabel: "Open project setup",
      href: `/projects/${firstProjectWithoutNotion.id}`,
    });
  }

  const firstProjectWithoutSync = projects.find(
    (project) => project.notionDatabaseId && hasStatusMapping(project) && !project.lastSyncedAt,
  );
  if (firstProjectWithoutSync && canPerformAction(role, "triggerManualSync")) {
    priorities.push({
      id: "run-first-sync",
      title: "Run the first sync",
      description:
        "A project is configured but still has no synced delivery data. The first sync makes the workspace feel real.",
      ctaLabel: "Open sync panel",
      href: `/projects/${firstProjectWithoutSync.id}`,
    });
  }

  const firstProjectNeedingAssignment = projects.find(
    (project) => project.lastSyncedAt && project.features.length > 0 && project._count.tickets > 0,
  );
  if (firstProjectNeedingAssignment) {
    priorities.push({
      id: "map-tickets",
      title: "Map synced work into features",
      description:
        "Ticket assignment is where raw synced work becomes the client-facing progress story.",
      ctaLabel: "Open tickets workspace",
      href: "/tickets",
    });
  }

  const firstReadyProject = projects.find(isReadyToShare);
  if (firstReadyProject && canPerformAction(role, "viewClientAccess")) {
    priorities.push({
      id: "prepare-sharing",
      title: "Review a project that is ready to share",
      description:
        "A project has crossed the core setup milestones. Review it and retrieve the safe client link when appropriate.",
      ctaLabel: "Open ready project",
      href: `/projects/${firstReadyProject.id}`,
    });
  }

  if (!priorities.length) {
    priorities.push({
      id: "review-projects",
      title: "Review active projects",
      description:
        "Use the project list to inspect each delivery track, confirm freshness, and decide what needs attention next.",
      ctaLabel: "Open projects",
      href: "/projects",
    });
  }

  return priorities.slice(0, 3);
}

export function buildDashboardProjectHealth(
  projects: Project[],
) {
  return [...projects]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .map((project) => {
      const nextStep = getNextProjectStep(project);
      const freshness = getSyncFreshness(project.lastSyncedAt);

      return {
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        progress: project.progressSummary?.overallProgress ?? 0,
        nextStepTitle: nextStep.title,
        nextStepDescription: nextStep.description,
        freshnessLabel: freshness.label,
        freshnessTone: freshness.tone,
        lastSyncedLabel: project.lastSyncedAt ? formatDateTime(project.lastSyncedAt) : "Awaiting first sync",
        ticketsLabel: `${project._count.tickets} synced ticket${project._count.tickets === 1 ? "" : "s"}`,
        featuresLabel: `${project.features.length} feature${project.features.length === 1 ? "" : "s"}`,
        updatedAt: project.updatedAt,
      };
    });
}
