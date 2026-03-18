import { memo, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Eye, ListChecks, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type TicketReviewSummaryProps = {
  totalMatching: number;
  selectedCount: number;
  visibleCount: number;
  unassignedOnPage: number;
  assignedOnPage: number;
  missingOnPage: number;
};

export const TicketReviewSummary = memo(function TicketReviewSummary({
  totalMatching,
  selectedCount,
  visibleCount,
  unassignedOnPage,
  assignedOnPage,
  missingOnPage,
}: TicketReviewSummaryProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        description="Tickets that match the current project view."
        icon={<ListChecks className="h-4 w-4" strokeWidth={2} />}
        label="Matching tickets"
        tone="neutral"
        value={String(totalMatching)}
      />
      <SummaryCard
        description="Selection for the active page."
        icon={<Target className="h-4 w-4" strokeWidth={2} />}
        label="Selected"
        tone="primary"
        value={String(selectedCount)}
      />
      <SummaryCard
        description={`Showing ${visibleCount} ticket${visibleCount === 1 ? "" : "s"} on this page.`}
        icon={<Eye className="h-4 w-4" strokeWidth={2} />}
        label="Visible now"
        tone="neutral"
        value={String(visibleCount)}
      />
      <SummaryCard
        description="Assignments still missing on this page."
        icon={<CircleAlert className="h-4 w-4" strokeWidth={2} />}
        label="Unassigned on page"
        tone="warning"
        value={String(unassignedOnPage)}
      />
      <SummaryCard
        description={`${missingOnPage} missing from source, ${assignedOnPage} already grouped.`}
        icon={<CircleCheck className="h-4 w-4" strokeWidth={2} />}
        label="Assigned on page"
        tone="success"
        value={String(assignedOnPage)}
      />
    </div>
  );
});

function SummaryCard({
  icon,
  label,
  value,
  description,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
  tone: "primary" | "success" | "warning" | "neutral";
}) {
  const toneClasses = {
    primary:
      "border-[color:color-mix(in_srgb,var(--primary)_22%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_10%,var(--surface))_0%,var(--surface)_100%)]",
    success:
      "border-[color:color-mix(in_srgb,var(--success)_22%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--success)_10%,var(--surface))_0%,var(--surface)_100%)]",
    warning:
      "border-[color:color-mix(in_srgb,var(--warning)_22%,var(--border))] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--warning)_10%,var(--surface))_0%,var(--surface)_100%)]",
    neutral: "border-[var(--border)] bg-[var(--surface)]",
  };

  return (
    <div className={cn("rounded-[var(--radius-lg)] border p-4 shadow-[var(--shadow-sm)]", toneClasses[tone])}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
        {icon}
        {label}
      </div>
      <div className="mt-4 text-3xl font-semibold leading-none tracking-tight">{value}</div>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground-muted)]">{description}</p>
    </div>
  );
}
