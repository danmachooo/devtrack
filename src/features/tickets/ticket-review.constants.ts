import type { DevtrackStatus } from "@/types/api";

export const ticketStatusOptions: Array<{ value: DevtrackStatus; label: string }> = [
  { value: "TODO", label: "Todo" },
  { value: "IN_DEV", label: "In development" },
  { value: "QA", label: "QA" },
  { value: "APPROVED", label: "Approved" },
  { value: "RELEASED", label: "Released" },
  { value: "BLOCKED", label: "Blocked" },
];
