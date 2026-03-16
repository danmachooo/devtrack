"use client";

import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren, useEffect } from "react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ErrorState } from "@/components/feedback/error-state";
import { Loader } from "@/components/feedback/loader";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";

export function InternalRouteGuard({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { data, error, isPending } = useSession();

  const session = data?.data.session;
  const user = data?.data.user;

  useEffect(() => {
    if (!isPending && !error && (!session || !user)) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/sign-in${next}`);
    }
  }, [error, isPending, pathname, router, session, user]);

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader label="Restoring your workspace session..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Session check failed"
        description="DevTrack could not confirm your session yet. Refresh and try again."
      />
    );
  }

  if (!session || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader label="Redirecting to sign in..." />
      </div>
    );
  }

  if (!session.activeOrganizationId) {
    if (pathname === "/organization") {
      return <>{children}</>;
    }

    return (
      <EmptyState
        title="You are signed in, but your workspace is not active yet"
        description="Create an organization or accept an invitation to unlock the internal workspace. Until the full org flow lands, this stays a guided onboarding state instead of dropping you into a broken dashboard."
        icon={
          <div className="rounded-full bg-[color:color-mix(in_srgb,var(--primary)_14%,transparent)] p-3">
            <span className="text-sm font-semibold uppercase tracking-[0.16em]">Org</span>
          </div>
        }
      >
        <Button variant="secondary" onClick={() => router.push("/organization")} type="button">
          Open organization area
        </Button>
      </EmptyState>
    );
  }

  return <>{children}</>;
}
