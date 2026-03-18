"use client";

import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useInternalSession } from "@/features/auth/internal-session-context";
import { canPerformAction, type PermissionAction } from "@/lib/auth/permissions";

type PageActionItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  action?: PermissionAction;
  variant?: "primary" | "secondary" | "ghost";
  icon?: ReactNode;
};

type RoleAwarePageActionsProps = {
  items: PageActionItem[];
};

export function RoleAwarePageActions({ items }: RoleAwarePageActionsProps) {
  const router = useRouter();
  const { data } = useInternalSession();
  const role = data?.data.user?.role;

  const visibleItems = items.filter((item) =>
    item.action ? canPerformAction(role, item.action) : true,
  );

  if (!visibleItems.length) {
    return null;
  }

  return (
    <>
      {visibleItems.map((item) => (
        <Button
          key={`${item.label}-${item.href ?? "action"}`}
          className="min-h-11 w-full justify-center sm:w-auto"
          onClick={() => {
            if (item.onClick) {
              item.onClick();
              return;
            }

            if (item.href) {
              router.push(item.href);
            }
          }}
          type="button"
          variant={item.variant ?? "secondary"}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </>
  );
}
