import { EmptyState } from "@/components/feedback/empty-state";
import { PageHeader } from "@/components/layout/page-header";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="A calm command center for the internal team workspace."
      />
      <EmptyState
        title="Dashboard foundation is ready"
        description="The shell, providers, token system, and session bootstrap are in place for the next feature pass."
        actionLabel="Build next screen"
      />
    </div>
  );
}
