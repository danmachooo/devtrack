"use client";

import {
  ArrowDownUp,
  FolderTree,
  Layers3,
  ListFilter,
  Rows3,
  Search,
  SlidersHorizontal,
  Tag,
  UserRoundSearch,
} from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BulkTicketActions } from "@/features/tickets/components/bulk-ticket-actions";
import { TicketFilterToggle } from "@/features/tickets/components/ticket-filter-toggle";
import { TicketListSkeleton } from "@/features/tickets/components/ticket-list-skeleton";
import { TicketPagination } from "@/features/tickets/components/ticket-pagination";
import { TicketRow } from "@/features/tickets/components/ticket-row";
import { TicketReviewSummary } from "@/features/tickets/components/ticket-review-summary";
import {
  ticketPageSizeOptions,
  ticketSortByOptions,
  ticketSortOrderOptions,
  ticketStatusOptions,
} from "@/features/tickets/ticket-review.constants";
import { useTicketReview } from "@/features/tickets/use-ticket-review";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import type { DevtrackStatus, Project, SortOrder, TicketSortBy } from "@/types/api";

type TicketReviewPanelProps = {
  project: Project;
};

export function TicketReviewPanel({ project }: TicketReviewPanelProps) {
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canAssignTickets = canPerformAction(role, "assignTickets");
  const {
    actions,
    assignMutation,
    bulkAssignMutation,
    features,
    filterState,
    pageMetrics,
    pagination,
    selectedTicketIds,
    allVisibleSelected,
    tickets,
    ticketsQuery,
  } = useTicketReview(project.id, {
    canAssignTickets,
  });

  const hasSelection = selectedTicketIds.length > 0;
  const isBusy = assignMutation.isPending || bulkAssignMutation.isPending;
  const totalMatching = pagination.totalItems;
  const pageSizeHelp = `${ticketPageSizeOptions.join(", ")} per page supported by the backend.`;

  return (
    <Card className="space-y-6 border-[color:color-mix(in_srgb,var(--primary)_12%,var(--border))] bg-[linear-gradient(180deg,var(--surface)_0%,var(--background)_100%)] p-6">
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          <Rows3 className="h-3.5 w-3.5" strokeWidth={2} />
          Ticket review
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-balance">
              Review synced tickets
            </h2>
            <p className="max-w-2xl text-sm leading-6 text-[var(--foreground-muted)] text-pretty">
              Search, sort, and batch-map source work into feature groups without losing project context.
            </p>
          </div>
          <InfoPopover label="More about ticket review">
            <p>
              This workspace keeps ticket assignment project-scoped while making large synced sets
              easier to triage and batch-map.
            </p>
          </InfoPopover>
        </div>
      </div>

      <TicketReviewSummary
        assignedOnPage={pageMetrics.assignedCount}
        missingOnPage={pageMetrics.missingCount}
        selectedCount={selectedTicketIds.length}
        totalMatching={totalMatching}
        unassignedOnPage={pageMetrics.unassignedCount}
        visibleCount={pageMetrics.visibleCount}
      />

      <div className="space-y-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_92%,var(--background))_0%,var(--background)_100%)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
            Filter, search, and sort this project view
          </div>
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
            {ticketsQuery.isFetching ? "Refreshing results" : `${totalMatching} matching`}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ticket-search-filter">
              <Search className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Search tickets
            </label>
            <Input
              id="ticket-search-filter"
              onChange={(event) => actions.setSearch(event.target.value)}
              placeholder="Search title or assignee"
              value={filterState.search}
            />
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ticket-assignee-filter">
              <UserRoundSearch className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Assignee
            </label>
            <Input
              id="ticket-assignee-filter"
              onChange={(event) => actions.setAssignee(event.target.value)}
              placeholder="Filter assignee"
              value={filterState.assignee}
            />
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ticket-feature-filter">
              <FolderTree className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Feature
            </label>
            <Select
              id="ticket-feature-filter"
              onChange={(event) => actions.setFeatureId(event.target.value)}
              value={filterState.featureId}
            >
              <option value="">All features</option>
              {features.map((feature) => (
                <option key={feature.id} value={feature.id}>
                  {feature.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ticket-status-filter">
              <Tag className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Mapped status
            </label>
            <Select
              id="ticket-status-filter"
              onChange={(event) => actions.setStatus((event.target.value as DevtrackStatus | "") || "")}
              value={filterState.status}
            >
              <option value="">All statuses</option>
              {ticketStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_0.8fr_0.8fr]">
          <TicketFilterToggle
            checked={filterState.showUnassigned}
            description="Great for inbox-style mapping, and keeps feature-specific filtering off."
            label="Unassigned only"
            onChange={actions.setShowUnassigned}
          />

          <TicketFilterToggle
            checked={filterState.showMissing}
            description="Includes source items that disappeared from Notion but were kept for history."
            label="Include missing"
            onChange={actions.setShowMissing}
          />

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ticket-sort-by">
              <ArrowDownUp className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Sort by
            </label>
            <Select
              id="ticket-sort-by"
              onChange={(event) => actions.setSortBy(event.target.value as TicketSortBy)}
              value={filterState.sortBy}
            >
              {ticketSortByOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
            <label className="flex items-center gap-2 text-sm font-medium" htmlFor="ticket-sort-order">
              <ArrowDownUp className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              Sort order
            </label>
            <Select
              id="ticket-sort-order"
              onChange={(event) => actions.setSortOrder(event.target.value as SortOrder)}
              value={filterState.sortOrder}
            >
              {ticketSortOrderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-sm)]">
          <p className="text-sm leading-6 text-[var(--foreground-muted)]">
            {filterState.showUnassigned
              ? `${totalMatching} ticket${totalMatching === 1 ? "" : "s"} are still waiting for a feature in this filtered view.`
              : `${totalMatching} ticket${totalMatching === 1 ? "" : "s"} match the current filters. Use search, sort, and bulk actions to narrow and map quickly.`}
          </p>
          {hasSelection ? (
            <Button onClick={actions.clearSelection} type="button" variant="ghost">
              Clear selection
            </Button>
          ) : null}
        </div>
      </div>

      {canAssignTickets && hasSelection ? (
        <BulkTicketActions
          allVisibleSelected={allVisibleSelected}
          features={features}
          isSubmitting={bulkAssignMutation.isPending}
          onBulkAssign={actions.bulkAssignTickets}
          onClearSelection={actions.clearSelection}
          onToggleSelectAllVisible={actions.toggleSelectAllVisible}
          selectedCount={selectedTicketIds.length}
        />
      ) : null}

      {ticketsQuery.isPending && !ticketsQuery.data ? (
        <TicketListSkeleton />
      ) : tickets.length ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              canAssignTickets={canAssignTickets}
              features={features}
              isSaving={assignMutation.isPending && assignMutation.variables?.ticketId === ticket.id}
              isSelected={selectedTicketIds.includes(ticket.id)}
              onAssign={(nextFeatureId) => actions.assignTicket(ticket.id, nextFeatureId)}
              onSelectChange={(checked) => actions.toggleTicketSelection(ticket.id, checked)}
              ticket={ticket}
            />
          ))}

          <TicketPagination
            isPending={ticketsQuery.isFetching || isBusy}
            onLimitChange={actions.setLimit}
            onPageChange={actions.setPage}
            pagination={pagination}
          />
          <p className="text-sm text-[var(--foreground-muted)]">{pageSizeHelp}</p>
        </div>
      ) : (
        <EmptyState
          title={project.lastSyncedAt ? "No tickets match these filters" : "No synced tickets yet"}
          description={
            project.lastSyncedAt
              ? "Try widening the filters, clearing search terms, or including missing tickets to inspect a broader slice of the synced work."
              : "Run the first sync after connecting Notion and saving the status mapping. Tickets will appear here once the source data lands."
          }
          icon={
            project.lastSyncedAt ? (
              <ListFilter className="h-6 w-6" strokeWidth={2.1} />
            ) : (
              <Layers3 className="h-6 w-6" strokeWidth={2.1} />
            )
          }
        />
      )}

      {assignMutation.isError ? (
        <p className="text-sm text-[var(--danger)]">
          {assignMutation.error instanceof Error
            ? assignMutation.error.message
            : "Ticket assignment failed. Try again."}
        </p>
      ) : null}

      {bulkAssignMutation.isError ? (
        <p className="text-sm text-[var(--danger)]">
          {bulkAssignMutation.error instanceof Error
            ? bulkAssignMutation.error.message
            : "Bulk ticket assignment failed. Try again."}
        </p>
      ) : null}
    </Card>
  );
}
