import type {
  FeatureProgressStatus,
  FeatureProgressSummary,
  ProjectFeatureSummary,
  Ticket,
} from "@/types/api";

function isCompletedTicket(status: Ticket["devtrackStatus"]) {
  return status === "APPROVED" || status === "RELEASED";
}

export function getFeatureProgressStatusLabel(status: FeatureProgressStatus) {
  switch (status) {
    case "NO_WORK_LOGGED":
      return "No work logged";
    case "NOT_STARTED":
      return "Not started";
    case "IN_PROGRESS":
      return "In progress";
    case "COMPLETED":
      return "Completed";
  }
}

export function getFeatureProgressTone(status: FeatureProgressStatus) {
  switch (status) {
    case "COMPLETED":
      return "success";
    case "IN_PROGRESS":
      return "warning";
    case "NOT_STARTED":
      return "neutral";
    case "NO_WORK_LOGGED":
      return "neutral";
  }
}

export function buildFeatureProgressSummaries(
  features: ProjectFeatureSummary[],
  tickets: Ticket[],
): FeatureProgressSummary[] {
  return [...features]
    .sort((left, right) => left.order - right.order)
    .map((feature) => {
      const assignedTickets = tickets.filter(
        (ticket) => ticket.featureId === feature.id && !ticket.isMissingFromSource,
      );
      const completedTickets = assignedTickets.filter((ticket) => isCompletedTicket(ticket.devtrackStatus)).length;
      const totalTickets = assignedTickets.length;
      const progress = totalTickets ? Math.round((completedTickets / totalTickets) * 100) : 0;

      let status: FeatureProgressStatus = "NO_WORK_LOGGED";

      if (totalTickets > 0) {
        if (completedTickets === totalTickets) {
          status = "COMPLETED";
        } else if (assignedTickets.every((ticket) => ticket.devtrackStatus === "TODO")) {
          status = "NOT_STARTED";
        } else {
          status = "IN_PROGRESS";
        }
      }

      return {
        featureId: feature.id,
        featureName: feature.name,
        order: feature.order,
        progress,
        status,
        totalTickets,
        completedTickets,
      };
    });
}

export function getAggregateProjectProgress(featureProgress: FeatureProgressSummary[]) {
  if (!featureProgress.length) {
    return 0;
  }

  const total = featureProgress.reduce((sum, feature) => sum + feature.progress, 0);
  return Math.round(total / featureProgress.length);
}
