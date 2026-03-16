import type { DevtrackStatus } from "@/types/api";

export function formatTicketStatus(status: DevtrackStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "Not started";
    case "IN_DEV":
      return "In development";
    case "APPROVED":
      return "Approved";
    case "RELEASED":
      return "Released";
  }
}

export function getTicketTone(status: DevtrackStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "neutral" as const;
    case "IN_DEV":
      return "warning" as const;
    case "APPROVED":
      return "success" as const;
    case "RELEASED":
      return "success" as const;
  }
}
