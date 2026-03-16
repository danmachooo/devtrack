"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { getProjectFeatures } from "@/lib/api/features.api";
import { getProjectTickets, updateTicketFeature } from "@/lib/api/tickets.api";
import type { DevtrackStatus, GetProjectTicketsQuery } from "@/types/api";

export function useTicketReview(projectId: string) {
  const queryClient = useQueryClient();
  const [featureId, setFeatureId] = useState("");
  const [status, setStatus] = useState<DevtrackStatus | "">("");
  const [showUnassigned, setShowUnassigned] = useState(false);
  const [showMissing, setShowMissing] = useState(false);

  const ticketFilters: GetProjectTicketsQuery = {
    featureId: featureId || undefined,
    status: status || undefined,
    unassigned: showUnassigned || undefined,
    showMissing,
  };

  const featuresQuery = useQuery({
    queryKey: ["project", projectId, "features"],
    queryFn: () => getProjectFeatures(projectId),
  });

  const ticketsQuery = useQuery({
    queryKey: ["project", projectId, "tickets", ticketFilters],
    queryFn: () => getProjectTickets(projectId, ticketFilters),
  });

  const assignMutation = useMutation({
    mutationFn: ({ ticketId, nextFeatureId }: { ticketId: string; nextFeatureId: string | null }) =>
      updateTicketFeature(ticketId, { featureId: nextFeatureId }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId, "tickets"] }),
        queryClient.invalidateQueries({ queryKey: ["project", projectId, "features"] }),
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
      ]);
    },
  });

  return {
    features: featuresQuery.data?.data ?? [],
    tickets: ticketsQuery.data?.data ?? [],
    featuresQuery,
    ticketsQuery,
    assignMutation,
    filterState: {
      featureId,
      status,
      showUnassigned,
      showMissing,
    },
    actions: {
      setFeatureId(nextFeatureId: string) {
        setFeatureId(nextFeatureId);
        if (nextFeatureId) {
          setShowUnassigned(false);
        }
      },
      setStatus,
      setShowUnassigned(checked: boolean) {
        setShowUnassigned(checked);
        if (checked) {
          setFeatureId("");
        }
      },
      setShowMissing,
      assignTicket(ticketId: string, nextFeatureId: string | null) {
        assignMutation.mutate({ ticketId, nextFeatureId });
      },
    },
  };
}
