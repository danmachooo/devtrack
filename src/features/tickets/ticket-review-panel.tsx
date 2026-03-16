"use client";

import { EmptyState } from "@/components/feedback/empty-state";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { TicketFilterToggle } from "@/features/tickets/components/ticket-filter-toggle";
import { TicketListSkeleton } from "@/features/tickets/components/ticket-list-skeleton";
import { TicketRow } from "@/features/tickets/components/ticket-row";
import { ticketStatusOptions } from "@/features/tickets/ticket-review.constants";
import { useTicketReview } from "@/features/tickets/use-ticket-review";
import type { DevtrackStatus, Project } from "@/types/api";

type TicketReviewPanelProps = {
  project: Project;
};

export function TicketReviewPanel({ project }: TicketReviewPanelProps) {
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canAssignTickets = canPerformAction(role, "assignTickets");
  const { actions, assignMutation, features, filterState, tickets, ticketsQuery } = useTicketReview(
    project.id,
  );

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          Ticket review
        </p>
        <h2 className="text-2xl font-semibold">Inspect synced work and map it to features</h2>
        <p className="text-sm text-[var(--foreground-muted)]">
          This is the analytical layer between raw Notion work and the client-facing feature story.
        </p>
      </div>

      <div className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ticket-feature-filter">
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

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="ticket-status-filter">
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

        <TicketFilterToggle
          checked={filterState.showUnassigned}
          description="Keeps feature-specific filtering off so the combination stays valid."
          label="Unassigned only"
          onChange={actions.setShowUnassigned}
        />

        <TicketFilterToggle
          checked={filterState.showMissing}
          description="Includes source items that disappeared from Notion but were kept for history."
          label="Include missing"
          onChange={actions.setShowMissing}
        />
      </div>

      {ticketsQuery.isPending ? (
        <TicketListSkeleton />
      ) : tickets.length ? (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketRow
              key={ticket.id}
              canAssignTickets={canAssignTickets}
              features={features}
              isSaving={assignMutation.isPending && assignMutation.variables?.ticketId === ticket.id}
              onAssign={(nextFeatureId) => actions.assignTicket(ticket.id, nextFeatureId)}
              ticket={ticket}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title={project.lastSyncedAt ? "No tickets match these filters" : "No synced tickets yet"}
          description={
            project.lastSyncedAt
              ? "Try widening the filters or include missing tickets to inspect a broader slice of the synced work."
              : "Run the first sync after connecting Notion and saving the status mapping. Tickets will appear here once the source data lands."
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
    </Card>
  );
}
