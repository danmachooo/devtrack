import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default function OrganizationPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Organization"
        description="This route is reserved for org setup, member management, and invitations."
      />
      <Card className="p-6">
        <p className="text-sm text-[var(--foreground-muted)]">
          Organization flows will be wired on top of the current shell in the next phase.
        </p>
      </Card>
    </div>
  );
}
