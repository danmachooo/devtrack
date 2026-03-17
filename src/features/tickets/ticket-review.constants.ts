import type { DevtrackStatus, SortOrder, TicketSortBy } from "@/types/api";

export const ticketStatusOptions: Array<{ value: DevtrackStatus; label: string }> = [
  { value: "TODO", label: "Todo" },
  { value: "IN_DEV", label: "In development" },
  { value: "QA", label: "QA" },
  { value: "APPROVED", label: "Approved" },
  { value: "RELEASED", label: "Released" },
  { value: "BLOCKED", label: "Blocked" },
];

export const ticketSortByOptions: Array<{ value: TicketSortBy; label: string }> = [
  { value: "syncedAt", label: "Recently synced" },
  { value: "updatedAt", label: "Recently updated" },
  { value: "createdAt", label: "Recently created" },
  { value: "title", label: "Title" },
  { value: "devtrackStatus", label: "Mapped status" },
];

export const ticketSortOrderOptions: Array<{ value: SortOrder; label: string }> = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export const ticketPageSizeOptions = [20, 40, 60, 100] as const;
