import { Card } from "@/components/ui/card";

type ClientPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ClientPage({ params }: ClientPageProps) {
  const { token } = await params;

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
          Client Dashboard
        </p>
        <h1 className="text-4xl font-semibold">Project Progress Overview</h1>
        <p className="max-w-2xl text-sm text-[var(--foreground-muted)]">
          Token route scaffolded for client-safe progress presentation. Token: {token}
        </p>
      </div>
      <Card className="p-8">
        <p className="text-sm text-[var(--foreground-muted)]">
          The public-facing shell is ready for client-safe mock data.
        </p>
      </Card>
    </div>
  );
}
