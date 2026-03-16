import { PropsWithChildren } from "react";

import { AuthShell } from "@/components/layout/auth-shell";

export default function AuthLayout({ children }: PropsWithChildren) {
  return <AuthShell>{children}</AuthShell>;
}
