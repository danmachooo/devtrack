import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/features/projects/project-utils";
import { TicketMetaItem } from "@/features/tickets/components/ticket-meta-item";
import { TicketStatusPill } from "@/features/tickets/components/ticket-status-pill";
import { formatTicketStatus, getTicketTone } from "@/features/tickets/ticket-review.utils";
import type { ProjectFeatureSummary, Ticket } from "@/types/api";

type TicketRowProps = {
  ticket: Ticket;
  features: ProjectFeatureSummary[];
  canAssignTickets: boolean;
  isSaving: boolean;
  onAssign: (featureId: string | null) => void;
};

export function TicketRow({
  ticket,
  features,
  canAssignTickets,
  isSaving,
  onAssign,
}: TicketRowProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusPill
                label={formatTicketStatus(ticket.devtrackStatus)}
                tone={getTicketTone(ticket.devtrackStatus)}
              />
              <TicketStatusPill
                label={ticket.isMissingFromSource ? "Missing from source" : "Available in source"}
                tone={ticket.isMissingFromSource ? "danger" : "success"}
              />
            </div>
            <h3 className="text-lg font-semibold">{ticket.title}</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <TicketMetaItem label="Source status" value={ticket.notionStatus} />
            <TicketMetaItem label="Assignee" value={ticket.assigneeName ?? "Unassigned"} />
            <TicketMetaItem label="Synced" value={formatDateTime(ticket.syncedAt)} />
            <TicketMetaItem label="Feature" value={ticket.feature?.name ?? "No feature yet"} />
            <TicketMetaItem
              label="Missing state"
              value={
                ticket.isMissingFromSource && ticket.missingFromSourceAt
                  ? `Missing since ${formatDateTime(ticket.missingFromSourceAt)}`
                  : "Still present in source"
              }
            />
          </div>
        </div>

        {canAssignTickets ? (
          <div className="w-full max-w-sm space-y-2 xl:w-72">
            <label className="text-sm font-medium" htmlFor={`feature-select-${ticket.id}`}>
              Feature assignment
            </label>
            <Select
              defaultValue={ticket.featureId ?? ""}
              disabled={isSaving}
              id={`feature-select-${ticket.id}`}
              onChange={(event) => onAssign(event.target.value || null)}
            >
              <option value="">Unassigned</option>
              {features.map((feature) => (
                <option key={feature.id} value={feature.id}>
                  {feature.name}
                </option>
              ))}
            </Select>
            <p className="text-sm text-[var(--foreground-muted)]">
              {isSaving
                ? "Saving assignment..."
                : "Only Team Leaders and Business Analysts can change this."}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
