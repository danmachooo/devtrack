import { PropsWithChildren } from "react";

export function ClientDashboardShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_7%,var(--background))_0%,var(--background)_35%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-5xl">{children}</div>
    </div>
  );
}
