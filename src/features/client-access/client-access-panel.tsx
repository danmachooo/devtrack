"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { useSession } from "@/hooks/use-session";
import { canPerformAction } from "@/lib/auth/permissions";
import { formatDateTime } from "@/features/projects/project-utils";
import { useClientAccess } from "@/features/client-access/use-client-access";
import type { Project } from "@/types/api";

type ClientAccessPanelProps = {
  project: Project;
};

export function ClientAccessPanel({ project }: ClientAccessPanelProps) {
  const { data: sessionResponse } = useSession();
  const role = sessionResponse?.data.user?.role;
  const canViewClientAccess = canPerformAction(role, "viewClientAccess");
  const { clientAccessQuery, copyLink, copyState } = useClientAccess(project.id, canViewClientAccess);

  if (!canViewClientAccess) {
    return null;
  }

  const clientAccess = clientAccessQuery.data?.data;

  return (
    <Card className="space-y-6 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
          Client access
        </p>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Share the client dashboard link</h2>
            <p className="text-sm text-[var(--foreground-muted)]">
              Copy the safe link without exposing raw token values.
            </p>
          </div>
          <InfoPopover label="More about client access">
            <p>
              Only the shareable client link is safe to show here. Raw client token values stay out
              of the UI.
            </p>
          </InfoPopover>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Shareable link
          </div>
          <div className="break-all rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 text-sm font-medium">
            {clientAccessQuery.isPending
              ? "Loading link..."
              : clientAccess?.clientAccessLink ?? "Client link unavailable"}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              disabled={!clientAccess?.clientAccessLink}
              onClick={() => copyLink(clientAccess?.clientAccessLink)}
              type="button"
            >
              {copyState === "copied" ? "Copied" : "Copy link"}
            </Button>
            <span className="text-sm text-[var(--foreground-muted)]">
              {copyState === "failed"
                ? "Clipboard access failed."
                : "Visible only to Team Leaders and Business Analysts."}
            </span>
          </div>
        </div>

        <div className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
            Viewing signal
          </div>
          <div className="text-lg font-semibold">
            {clientAccess?.lastViewedAt ? formatDateTime(clientAccess.lastViewedAt) : "Not viewed yet"}
          </div>
          <p className="text-sm text-[var(--foreground-muted)]">
            {clientAccess?.lastViewedAt
              ? "This is the latest recorded visit to the client-safe dashboard."
              : "Once the client opens the dashboard, the latest view time will appear here."}
          </p>
        </div>
      </div>

      {clientAccessQuery.isError ? (
        <p className="text-sm text-[var(--danger)]">
          {clientAccessQuery.error instanceof Error
            ? clientAccessQuery.error.message
            : "Client access could not be loaded."}
        </p>
      ) : null}
    </Card>
  );
}
