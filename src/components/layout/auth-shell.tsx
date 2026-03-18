import { PropsWithChildren } from "react";

import { BrandMark } from "@/components/layout/brand-mark";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_10%,transparent),_transparent_35%),var(--background)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <BrandMark href="/sign-in" priority size="md" subtitle="Internal workspace" />
        </div>
        {children}
      </div>
    </div>
  );
}
