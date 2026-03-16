import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { RoleAwarePageActions } from "@/components/layout/role-aware-page-actions";

export default function TicketsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tickets"
        description="The ticket workspace is scaffolded and ready for dense mock-backed table work."
        actions={
          <RoleAwarePageActions
            items={[
              {
                label: "Manage assignments",
                href: "/tickets",
                action: "assignTickets",
              },
              {
                label: "View projects",
                href: "/projects",
                variant: "ghost",
              },
            ]}
          />
        }
      />
      <Card className="p-6">
        <p className="text-sm text-[var(--foreground-muted)]">
          Ticket list foundation is ready for filters, assignment flows, and API-shaped mock data.
        </p>
      </Card>
    </div>
  );
}
