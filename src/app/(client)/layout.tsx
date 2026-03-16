import { PropsWithChildren } from "react";

import { ClientDashboardShell } from "@/components/layout/client-dashboard-shell";

export default function ClientLayout({ children }: PropsWithChildren) {
  return <ClientDashboardShell>{children}</ClientDashboardShell>;
}
