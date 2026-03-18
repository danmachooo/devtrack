import { PropsWithChildren } from "react";

import { InternalAppShell } from "@/components/layout/internal-app-shell";
import { InternalRouteGuard } from "@/features/auth/auth-guard";
import { InternalSessionProvider } from "@/features/auth/internal-session-context";

export default function InternalLayout({ children }: PropsWithChildren) {
  return (
    <InternalSessionProvider>
      <InternalAppShell>
        <InternalRouteGuard>{children}</InternalRouteGuard>
      </InternalAppShell>
    </InternalSessionProvider>
  );
}
