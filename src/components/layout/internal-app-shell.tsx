"use client";

import {
  Building2,
  ChevronsUpDown,
  FolderKanban,
  LayoutDashboard,
  MoonStar,
  PanelLeftClose,
  PanelLeftOpen,
  SunMedium,
  Ticket,
  UserCircle2,
} from "lucide-react";
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/organization", label: "Organization", icon: Building2 },
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
  const userEmail = user?.email ?? "Loading session";
  const userRole = user?.role ? formatRoleLabel(user.role) : "Restoring access";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="grid min-h-screen grid-cols-1 md:grid-cols-[auto_1fr]">
        <aside
          className={`sticky top-0 flex h-screen self-start flex-col border-r border-[var(--border)] bg-[var(--surface)] px-4 py-6 transition-all ${
            isSidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="mb-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-[color:color-mix(in_srgb,var(--primary)_18%,var(--surface))] text-[var(--primary)] shadow-[var(--shadow-sm)]">
                <LayoutDashboard className="h-5 w-5" strokeWidth={2.1} />
              </div>
              <div className={isSidebarOpen ? "block" : "hidden"}>
                <div className="text-lg font-semibold">DevTrack</div>
                <div className="text-xs uppercase tracking-[0.18em] text-[var(--foreground-muted)]">
                  Internal workspace
                </div>
              </div>
            </div>
            <button
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              onClick={toggleSidebar}
              type="button"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" strokeWidth={2} />
              ) : (
                <PanelLeftOpen className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
          <nav className="space-y-2">
            {navigation.map((item) => (
              <SidebarNavLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                isActive={pathname === item.href}
                isSidebarOpen={isSidebarOpen}
                label={item.label}
              />
            ))}
          </nav>

          <div className="mt-auto space-y-3 pt-6">
            <button
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`flex w-full items-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                isSidebarOpen ? "gap-3 justify-between" : "justify-center"
              }`}
              onClick={toggleThemeMode}
              type="button"
              title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className={`flex items-center ${isSidebarOpen ? "gap-3" : ""}`}>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]">
                  {themeMode === "dark" ? (
                    <SunMedium className="h-4 w-4" strokeWidth={2.1} />
                  ) : (
                    <MoonStar className="h-4 w-4" strokeWidth={2.1} />
                  )}
                </span>
                {isSidebarOpen ? <span>{themeMode === "dark" ? "Light mode" : "Dark mode"}</span> : null}
              </span>
              {isSidebarOpen ? (
                <span className="text-xs uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                  {themeMode}
                </span>
              ) : null}
            </button>

            <details className="group relative">
              <summary
                className={`flex cursor-pointer list-none items-center rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--background)] text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  isSidebarOpen
                    ? "w-full justify-between gap-3 px-3 py-3"
                    : "mx-auto h-14 w-14 justify-center p-0"
                }`}
                title={isSidebarOpen ? undefined : "Account"}
              >
                <span className={`flex min-w-0 items-center ${isSidebarOpen ? "gap-3" : ""}`}>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)]">
                    <UserCircle2 className="h-5 w-5" strokeWidth={2} />
                  </span>
                  {isSidebarOpen ? (
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{userName}</span>
                      <span className="block truncate text-xs text-[var(--foreground-muted)]">{userRole}</span>
                    </span>
                  ) : null}
                </span>
                {isSidebarOpen ? <ChevronsUpDown className="h-4 w-4 text-[var(--foreground-muted)]" strokeWidth={2} /> : null}
              </summary>
              <div
                className={`absolute left-full z-20 ml-3 w-72 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-md)] ${
                  isSidebarOpen ? "bottom-0" : "bottom-1/2 translate-y-1/2"
                }`}
              >
                <div className="space-y-1">
                  <p className="font-semibold">{userName}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">{user?.email ?? "Loading email"}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">{userRole}</p>
                </div>
                <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground-muted)]">
                  {activeOrgId ? organizationName : "Workspace onboarding"}
                </div>
                <div className="mt-4 flex items-center justify-end border-t border-[var(--border)] pt-4">
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
              </div>
              <div className="text-sm text-[var(--foreground-muted)]">
                {userName} | {userEmail}
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

function SidebarNavLink({
  href,
  icon: Icon,
  isActive,
  isSidebarOpen,
  label,
}: {
  href: string;
  icon: typeof LayoutDashboard;
  isActive: boolean;
  isSidebarOpen: boolean;
  label: string;
}) {
  return (
    <Link
      aria-label={label}
      href={href}
      title={isSidebarOpen ? undefined : label}
      className={`flex items-center rounded-[var(--radius-md)] px-3 py-3 text-sm font-medium transition ${
        isActive
          ? "bg-[color:color-mix(in_srgb,var(--primary)_16%,var(--surface))] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
      } ${isSidebarOpen ? "gap-3" : "justify-center"}`}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
      {isSidebarOpen ? <span>{label}</span> : null}
    </Link>
  );
}
