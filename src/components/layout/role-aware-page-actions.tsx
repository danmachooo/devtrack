"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { canPerformAction, type PermissionAction } from "@/lib/auth/permissions";

type PageActionItem = {
  label: string;
  href?: string;
  onClick?: () => void;
  action?: PermissionAction;
  variant?: "primary" | "secondary" | "ghost";
};

type RoleAwarePageActionsProps = {
  items: PageActionItem[];
};

export function RoleAwarePageActions({ items }: RoleAwarePageActionsProps) {
  const router = useRouter();
  const { data } = useSession();
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
          {item.label}
        </Button>
      ))}
    </>
  );
}
