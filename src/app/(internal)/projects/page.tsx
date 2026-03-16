import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="This screen is ready for mock-backed project cards and list interactions."
      />
      <Card className="p-6">
        <p className="text-sm text-[var(--foreground-muted)]">
          Project list foundation is ready for API-shaped mock data.
        </p>
      </Card>
    </div>
  );
}
