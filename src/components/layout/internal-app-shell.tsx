"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropsWithChildren } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/lib/api/auth.api";
import { formatRoleLabel } from "@/lib/auth/permissions";
import { getOrganization } from "@/lib/api/organization.api";
import { useUiStore } from "@/store/ui-store";
import { appConfig } from "@/lib/config/app";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tickets", label: "Tickets" },
  { href: "/organization", label: "Organization" },
];

export function InternalAppShell({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isSidebarOpen, toggleSidebar, themeMode, toggleThemeMode } = useUiStore();
  const { data } = useSession();
  const signOutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.replace("/sign-in");
    },
  });

  const activeOrgId = data?.data.session?.activeOrganizationId;
  const user = data?.data.user;
  const organizationQuery = useQuery({
    queryKey: ["organization", activeOrgId, "shell"],
    queryFn: getOrganization,
    enabled: Boolean(activeOrgId),
    staleTime: 60_000,
  });

  const organizationName = organizationQuery.data?.data.name ?? "Workspace onboarding";
  const organizationSlug = organizationQuery.data?.data.slug;
  const userName = user?.name ?? "Loading session";
  const userRole = user?.role ? formatRoleLabel(user.role) : "Restoring access";

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
                className={`flex rounded-[var(--radius-md)] px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-[color:color-mix(in_srgb,var(--primary)_16%,var(--surface))] text-[var(--foreground)]"
                    : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {isSidebarOpen ? item.label : item.label.slice(0, 1)}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_78%,transparent)] px-6 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 shadow-[var(--shadow-sm)]">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-[var(--foreground-muted)]">
                    Active Workspace
                  </div>
                  <div className="mt-1 text-sm font-semibold">{organizationName}</div>
                  <div className="text-xs text-[var(--foreground-muted)]">
                    {activeOrgId
                      ? organizationSlug
                        ? `Organization slug: ${organizationSlug}`
                        : "Organization details are syncing"
                      : "Create or accept an organization to unlock internal workflows"}
                  </div>
                </div>
                <div className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                  {activeOrgId ? userRole : "Onboarding"}
                </div>
                <div className="hidden text-sm text-[var(--foreground-muted)] md:block">
                  {appConfig.useMockApi ? "Mock session mode" : "Live API mode"}
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Button onClick={toggleThemeMode} type="button" variant="secondary">
                  {themeMode === "dark" ? "Use light mode" : "Use dark mode"}
                </Button>
                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                    {userName}
                  </summary>
                  <div className="absolute right-0 z-10 mt-3 w-72 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-md)]">
                    <div className="space-y-1">
                      <p className="font-semibold">{userName}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{user?.email ?? "Loading email"}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{userRole}</p>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                      <span className="text-sm text-[var(--foreground-muted)]">Workspace menu</span>
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
                </details>
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
