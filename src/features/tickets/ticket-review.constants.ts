import type { DevtrackStatus } from "@/types/api";

export const ticketStatusOptions: Array<{ value: DevtrackStatus; label: string }> = [
  { value: "NOT_STARTED", label: "Not started" },
  { value: "IN_DEV", label: "In development" },
  { value: "APPROVED", label: "Approved" },
  { value: "RELEASED", label: "Released" },
];
