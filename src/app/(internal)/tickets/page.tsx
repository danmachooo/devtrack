import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default function TicketsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Tickets"
        description="The ticket workspace is scaffolded and ready for dense mock-backed table work."
      />
      <Card className="p-6">
        <p className="text-sm text-[var(--foreground-muted)]">
          Ticket list foundation is ready for filters, assignment flows, and API-shaped mock data.
        </p>
      </Card>
    </div>
  );
}
