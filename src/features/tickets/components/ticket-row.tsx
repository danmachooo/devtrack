import { ArrowRightLeft, FolderTree } from "lucide-react";
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
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5 shadow-[var(--shadow-sm)] transition duration-200 hover:border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))]">
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
            <h3 className="max-w-3xl text-lg font-semibold leading-7 text-balance">{ticket.title}</h3>
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
          <div className="w-full max-w-sm space-y-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 xl:w-80">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FolderTree className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
              <label htmlFor={`feature-select-${ticket.id}`}>Feature assignment</label>
            </div>
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
            <p className="flex items-start gap-2 text-sm leading-6 text-[var(--foreground-muted)]">
              <ArrowRightLeft className="mt-1 h-4 w-4 shrink-0 text-[var(--foreground-muted)]" strokeWidth={2} />
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
