import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ticketPageSizeOptions } from "@/features/tickets/ticket-review.constants";
import type { PaginatedResultMeta } from "@/types/api";

type TicketPaginationProps = {
  pagination: PaginatedResultMeta;
  isPending: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function TicketPagination({
  pagination,
  isPending,
  onPageChange,
  onLimitChange,
}: TicketPaginationProps) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,color-mix(in_srgb,var(--background)_90%,var(--surface))_100%)] p-5 shadow-[var(--shadow-sm)]">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">Pagination</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-medium">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <span className="text-sm leading-6 text-[var(--foreground-muted)]">
              {pagination.totalItems} matching ticket{pagination.totalItems === 1 ? "" : "s"} across this project view.
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,10rem)_auto] sm:items-end">
          <div className="min-w-32 space-y-2">
            <label className="text-sm font-medium" htmlFor="ticket-page-size">
              Results per page
            </label>
            <Select
              disabled={isPending}
              id="ticket-page-size"
              onChange={(event) => onLimitChange(Number(event.target.value))}
              value={String(pagination.limit)}
            >
              {ticketPageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} per page
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-start gap-2 sm:justify-end">
            <Button
              disabled={!pagination.hasPreviousPage || isPending}
              onClick={() => onPageChange(pagination.page - 1)}
              type="button"
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              Previous
            </Button>
            <Button
              disabled={!pagination.hasNextPage || isPending}
              onClick={() => onPageChange(pagination.page + 1)}
              type="button"
            >
              Next
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
