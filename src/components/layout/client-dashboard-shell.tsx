import { PropsWithChildren } from "react";

import { BrandMark } from "@/components/layout/brand-mark";

export function ClientDashboardShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_7%,var(--background))_0%,var(--background)_35%)] px-4 py-6 sm:py-8 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex justify-center md:justify-start">
          <BrandMark priority size="lg" subtitle="Client progress view" />
        </div>
        {children}
      </div>
    </div>
  );
}
