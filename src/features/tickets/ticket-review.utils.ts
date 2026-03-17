import type { DevtrackStatus } from "@/types/api";

function humanizeStatusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatTicketStatus(status: DevtrackStatus | string) {
  switch (status) {
    case "TODO":
      return "Todo";
    case "IN_DEV":
      return "In development";
    case "QA":
      return "QA";
    case "APPROVED":
      return "Approved";
    case "RELEASED":
      return "Released";
    case "BLOCKED":
      return "Blocked";
    default:
      return humanizeStatusLabel(status);
  }
}

export function getTicketTone(status: DevtrackStatus | string) {
  switch (status) {
    case "TODO":
      return "neutral" as const;
    case "IN_DEV":
      return "warning" as const;
    case "QA":
      return "warning" as const;
    case "APPROVED":
      return "success" as const;
    case "RELEASED":
      return "success" as const;
    case "BLOCKED":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}
