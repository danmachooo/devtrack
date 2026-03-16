import { PropsWithChildren } from "react";

import { InternalAppShell } from "@/components/layout/internal-app-shell";

export default function InternalLayout({ children }: PropsWithChildren) {
  return <InternalAppShell>{children}</InternalAppShell>;
}
