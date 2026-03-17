import type { ReactNode } from "react";
import { ArrowRightLeft, FolderTree, Layers3, RefreshCcw, UserRound } from "lucide-react";
import { Select } from "@/components/ui/select";
import { formatDateTime } from "@/features/projects/project-utils";
import { TicketMetaItem } from "@/features/tickets/components/ticket-meta-item";
import { TicketStatusPill } from "@/features/tickets/components/ticket-status-pill";
import { formatTicketStatus, getTicketTone } from "@/features/tickets/ticket-review.utils";
import { cn } from "@/lib/utils";
import type { ProjectFeatureSummary, Ticket } from "@/types/api";

type TicketRowProps = {
  ticket: Ticket;
  features: ProjectFeatureSummary[];
  canAssignTickets: boolean;
  isSaving: boolean;
  isSelected: boolean;
  onAssign: (featureId: string | null) => void;
  onSelectChange: (checked: boolean) => void;
};

export function TicketRow({
  ticket,
  features,
  canAssignTickets,
  isSaving,
  isSelected,
  onAssign,
  onSelectChange,
}: TicketRowProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border bg-[linear-gradient(180deg,var(--background)_0%,color-mix(in_srgb,var(--surface)_88%,var(--background))_100%)] p-5 shadow-[var(--shadow-sm)] transition duration-200 hover:border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))]",
        isSelected
          ? "border-[color:color-mix(in_srgb,var(--primary)_26%,var(--border))] ring-1 ring-[color:color-mix(in_srgb,var(--primary)_18%,transparent)]"
          : "border-[var(--border)]",
      )}
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-3">
            {canAssignTickets ? (
              <label className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm font-medium text-[var(--foreground-muted)]">
                <input
                  checked={isSelected}
                  className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  onChange={(event) => onSelectChange(event.target.checked)}
                  type="checkbox"
                />
                Select ticket
              </label>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <TicketStatusPill
                label={formatTicketStatus(ticket.devtrackStatus)}
                tone={getTicketTone(ticket.devtrackStatus)}
              />
              <TicketStatusPill
                label={ticket.isMissingFromSource ? "Missing from source" : "Available in source"}
                tone={ticket.isMissingFromSource ? "danger" : "success"}
              />
              {ticket.feature?.name ? (
                <span className="inline-flex min-h-7 items-center rounded-full border border-[color:color-mix(in_srgb,var(--primary)_18%,var(--border))] bg-[color:color-mix(in_srgb,var(--primary)_10%,var(--surface))] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary)]">
                  In {ticket.feature.name}
                </span>
              ) : null}
            </div>
            <h3 className="max-w-3xl text-lg font-semibold leading-7 text-balance">{ticket.title}</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <TicketMetaCard
              icon={<Layers3 className="h-4 w-4" strokeWidth={2} />}
              label="Source status"
              value={ticket.notionStatus}
            />
            <TicketMetaCard
              icon={<UserRound className="h-4 w-4" strokeWidth={2} />}
              label="Assignee"
              value={ticket.assigneeName ?? "Unassigned"}
            />
            <TicketMetaCard
              icon={<RefreshCcw className="h-4 w-4" strokeWidth={2} />}
              label="Synced"
              value={formatDateTime(ticket.syncedAt)}
            />
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
          <div className="w-full max-w-sm space-y-3 rounded-[var(--radius-xl)] border border-[color:color-mix(in_srgb,var(--primary)_16%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_8%,var(--surface))_0%,var(--surface)_100%)] p-4 xl:w-80">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FolderTree className="h-4 w-4 text-[var(--primary)]" strokeWidth={2} />
                <label htmlFor={`feature-select-${ticket.id}`}>Feature assignment</label>
              </div>
              <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                Keep this ticket aligned with the client-facing feature story.
              </p>
            </div>
            <Select
              value={ticket.featureId ?? ""}
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
            <p className="flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6 text-[var(--foreground-muted)]">
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

function TicketMetaCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3.5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-medium leading-6">{value}</div>
    </div>
  );
}
