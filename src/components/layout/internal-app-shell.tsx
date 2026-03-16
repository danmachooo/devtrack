"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/lib/api/auth.api";
import { useUiStore } from "@/store/ui-store";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tickets", label: "Tickets" },
  { href: "/organization", label: "Organization" },
];

export function InternalAppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isSidebarOpen, toggleSidebar } = useUiStore();
  const { data } = useSession();
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.replace("/sign-in");
    },
  });

  const activeOrgId = data?.data.session?.activeOrganizationId;
  const userName = data?.data.user?.name ?? "Loading session";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[auto_1fr]">
        <aside
          className={`border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 transition-all ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="mb-10 flex items-center justify-between gap-3">
            <div className={`${isSidebarOpen ? "block" : "hidden"} text-lg font-semibold`}>
              DevTrack
            </div>
            <button
              className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 text-sm"
              onClick={toggleSidebar}
              type="button"
            >
              {isSidebarOpen ? "Hide" : "Menu"}
            </button>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
              >
                {isSidebarOpen ? item.label : item.label.slice(0, 1)}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_70%,transparent)] px-6 py-4 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-[var(--foreground-muted)]">
                  Active Workspace
                </div>
                <div className="text-sm font-semibold">
                  {activeOrgId ? userName : `${userName} - Onboarding`}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-[var(--foreground-muted)]">Stone + Forest Green</div>
                <Button
                  variant="secondary"
                  onClick={() => signOutMutation.mutate()}
                  disabled={signOutMutation.isPending}
                  type="button"
                >
                  {signOutMutation.isPending ? "Signing out..." : "Sign out"}
                </Button>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
