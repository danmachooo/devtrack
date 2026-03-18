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

import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { signOut } from "@/lib/api/auth.api";
import { formatRoleLabel } from "@/lib/auth/permissions";
import { getOrganization } from "@/lib/api/organization.api";
import { useUiStore } from "@/store/ui-store";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/organization", label: "Organization", icon: Building2 },
];

const collapsedSidebarUtilityClasses = "mx-auto h-10 w-10 justify-center p-0";
const sidebarFooterTriggerBaseClasses =
  "flex items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--background)] text-sm font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]";
const sidebarFooterIconClasses =
  "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--surface-muted)_72%,transparent)] text-[var(--foreground-muted)]";
const sidebarLabelTransitionClasses =
  "overflow-hidden transition-[max-width,opacity,margin] duration-200 ease-out";

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
          className={`sticky top-0 flex h-screen self-start flex-col overflow-visible border-r border-[var(--border)] bg-[var(--surface)] py-6 transition-[width,padding] duration-200 ease-out ${
            isSidebarOpen ? "w-64 px-4" : "w-20 px-0"
          }`}
        >
          <button
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className="absolute top-8 right-0 z-30 inline-flex h-10 w-7 translate-x-1/2 items-center justify-center rounded-full border border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_96%,transparent)] text-[var(--foreground-muted)] shadow-[var(--shadow-sm)] backdrop-blur transition hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            onClick={toggleSidebar}
            type="button"
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-4 w-4" strokeWidth={2} />
            ) : (
              <PanelLeftOpen className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
          <div className={`mb-5 flex ${isSidebarOpen ? "items-center" : "justify-center"}`}>
            <div className="flex items-center overflow-hidden">
              <BrandMark
                className={isSidebarOpen ? undefined : "justify-center"}
                href="/dashboard"
                imageClassName="shadow-[var(--shadow-sm)]"
                priority
                showLabel={isSidebarOpen}
                size="sm"
                subtitle={undefined}
              />
            </div>
          </div>
          <nav className={isSidebarOpen ? "space-y-2" : "flex flex-col items-center gap-4"}>
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

          <div className={`mt-auto pt-6 ${isSidebarOpen ? "space-y-3" : "flex w-full flex-col items-center gap-3"}`}>
            <button
              aria-label={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className={`${sidebarFooterTriggerBaseClasses} ${
                isSidebarOpen
                  ? "h-11 w-full justify-between gap-3 px-3"
                  : collapsedSidebarUtilityClasses
              }`}
              onClick={toggleThemeMode}
              type="button"
              title={themeMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className={sidebarFooterIconClasses}>
                  {themeMode === "dark" ? (
                    <SunMedium className="h-4 w-4" strokeWidth={2.1} />
                  ) : (
                    <MoonStar className="h-4 w-4" strokeWidth={2.1} />
                  )}
                </span>
                <span
                  className={`${sidebarLabelTransitionClasses} whitespace-nowrap ${
                    isSidebarOpen ? "max-w-32 opacity-100" : "max-w-0 opacity-0"
                  }`}
                >
                  {themeMode === "dark" ? "Light mode" : "Dark mode"}
                </span>
              </span>
              <span
                className={`${sidebarLabelTransitionClasses} whitespace-nowrap text-xs uppercase tracking-[0.16em] text-[var(--foreground-muted)] ${
                  isSidebarOpen ? "max-w-20 opacity-100" : "max-w-0 opacity-0"
                }`}
              >
                {themeMode}
              </span>
            </button>

            <details className={`group relative ${isSidebarOpen ? "block" : "flex w-full justify-center"}`}>
              <summary
                className={`${sidebarFooterTriggerBaseClasses} cursor-pointer list-none ${
                  isSidebarOpen
                    ? "h-11 w-full justify-between gap-3 px-3"
                    : collapsedSidebarUtilityClasses
                }`}
                title={isSidebarOpen ? undefined : "Account"}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className={sidebarFooterIconClasses}>
                    <UserCircle2 className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span
                    className={`${sidebarLabelTransitionClasses} min-w-0 ${
                      isSidebarOpen ? "max-w-32 opacity-100" : "max-w-0 opacity-0"
                    }`}
                  >
                    <span className="block truncate text-sm font-semibold">{userName}</span>
                    <span className="block truncate text-xs text-[var(--foreground-muted)]">{userRole}</span>
                  </span>
                </span>
                <ChevronsUpDown
                  className={`h-4 w-4 shrink-0 text-[var(--foreground-muted)] transition-opacity duration-200 ${
                    isSidebarOpen ? "opacity-100" : "hidden opacity-0"
                  }`}
                  strokeWidth={2}
                />
              </summary>
              <div
                className="absolute bottom-0 left-full z-40 ml-3 w-72 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-md)]"
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
          <header className="relative z-0 border-b border-[var(--border)] bg-[color:color-mix(in_srgb,var(--surface)_78%,transparent)] px-6 py-4 md:pl-10 backdrop-blur">
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
          <main className="flex-1 px-6 py-8 md:pl-10">{children}</main>
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
      className={`flex items-center rounded-[var(--radius-md)] text-sm font-medium transition ${
        isActive
          ? "bg-[color:color-mix(in_srgb,var(--primary)_14%,var(--surface))] text-[var(--foreground)] shadow-[var(--shadow-sm)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]"
      } ${
        isSidebarOpen
          ? "gap-3 px-3 py-3"
          : "h-10 w-10 justify-center self-center rounded-xl"
      }`}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={2} />
      <span
        className={`${sidebarLabelTransitionClasses} whitespace-nowrap ${
          isSidebarOpen ? "max-w-28 opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}
