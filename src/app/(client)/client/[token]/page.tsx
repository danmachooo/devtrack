import { ClientDashboardView } from "@/features/client-dashboard/client-dashboard-view";

type ClientPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ClientPage({ params }: ClientPageProps) {
  const { token } = await params;

  return <ClientDashboardView token={token} />;
}
