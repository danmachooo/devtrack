"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { getProjectClientAccess } from "@/lib/api/client.api";
import { useUiStore } from "@/store/ui-store";

export function useClientAccess(projectId: string, enabled: boolean) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const showToast = useUiStore((state) => state.showToast);

  const clientAccessQuery = useQuery({
    queryKey: ["project", projectId, "client-access"],
    queryFn: () => getProjectClientAccess(projectId),
    enabled,
  });

  useEffect(() => {
    if (copyState === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => setCopyState("idle"), 1_800);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  return {
    clientAccessQuery,
    copyState,
    async copyLink(link: string | undefined) {
      if (!link) {
        return;
      }

      try {
        await navigator.clipboard.writeText(link);
        setCopyState("copied");
        showToast({
          tone: "success",
          title: "Client link copied",
          description: "The shareable dashboard link is ready to paste.",
        });
      } catch {
        setCopyState("failed");
        showToast({
          tone: "error",
          title: "Clipboard copy failed",
          description: "Copy the client link manually from the field instead.",
        });
      }
    },
  };
}
