import { PropsWithChildren } from "react";

export function AuthShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--primary)_10%,transparent),_transparent_35%),var(--background)] px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
