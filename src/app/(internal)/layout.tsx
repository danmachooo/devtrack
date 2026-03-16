import { PropsWithChildren } from "react";

import { InternalAppShell } from "@/components/layout/internal-app-shell";
import { InternalRouteGuard } from "@/features/auth/auth-guard";

export default function InternalLayout({ children }: PropsWithChildren) {
  return (
    <InternalAppShell>
      <InternalRouteGuard>{children}</InternalRouteGuard>
    </InternalAppShell>
  );
}
