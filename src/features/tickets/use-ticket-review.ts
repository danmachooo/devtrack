"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { getProjectFeatures } from "@/lib/api/features.api";
import {
  bulkUpdateTicketFeature,
  getProjectTickets,
  updateTicketFeature,
} from "@/lib/api/tickets.api";
import type {
  BulkUpdateTicketFeaturePayload,
  DevtrackStatus,
  GetProjectTicketsQuery,
  SortOrder,
  TicketSortBy,
} from "@/types/api";

type UseTicketReviewOptions = {
  canAssignTickets: boolean;
};

export function useTicketReview(projectId: string, options: UseTicketReviewOptions) {
  const queryClient = useQueryClient();
  const [featureId, setFeatureId] = useState("");
  const [status, setStatus] = useState<DevtrackStatus | "">("");
  const [showUnassigned, setShowUnassigned] = useState(options.canAssignTickets);
  const [showMissing, setShowMissing] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [assigneeInput, setAssigneeInput] = useState("");
  const [sortBy, setSortBy] = useState<TicketSortBy>("syncedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);

  const deferredSearch = useDeferredValue(searchInput.trim());
  const deferredAssignee = useDeferredValue(assigneeInput.trim());

  useEffect(() => {
    setShowUnassigned(options.canAssignTickets);
    setSelectedTicketIds([]);
    setPage(1);
  }, [options.canAssignTickets, projectId]);

  const ticketFilters: GetProjectTicketsQuery = {
    featureId: featureId || undefined,
    status: status || undefined,
    unassigned: showUnassigned || undefined,
    showMissing,
    page,
    limit,
    search: deferredSearch || undefined,
    assignee: deferredAssignee || undefined,
    sortBy,
    sortOrder,
  };

  const featuresQuery = useQuery({
    queryKey: ["project", projectId, "features"],
    queryFn: () => getProjectFeatures(projectId),
  });

  const ticketsQuery = useQuery({
    queryKey: ["project", projectId, "tickets", ticketFilters],
    queryFn: () => getProjectTickets(projectId, ticketFilters),
    placeholderData: keepPreviousData,
  });

  const tickets = ticketsQuery.data?.data.items ?? [];
  const pagination = ticketsQuery.data?.data.pagination ?? {
    page,
    limit,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  const visibleTicketIds = useMemo(() => tickets.map((ticket) => ticket.id), [tickets]);
  const allVisibleSelected = visibleTicketIds.length > 0 && visibleTicketIds.every((id) => selectedTicketIds.includes(id));
  const selectedVisibleCount = visibleTicketIds.filter((id) => selectedTicketIds.includes(id)).length;

  const pageMetrics = useMemo(() => {
    const missingCount = tickets.filter((ticket) => ticket.isMissingFromSource).length;
    const unassignedCount = tickets.filter((ticket) => ticket.featureId === null).length;

    return {
      visibleCount: tickets.length,
      missingCount,
      unassignedCount,
      assignedCount: tickets.length - unassignedCount,
    };
  }, [tickets]);

  const clearSelection = () => setSelectedTicketIds([]);

  useEffect(() => {
    setSelectedTicketIds((current) => {
      const nextSelected = current.filter((ticketId) => visibleTicketIds.includes(ticketId));

      if (nextSelected.length === current.length) {
        return current;
      }

      return nextSelected;
    });
  }, [visibleTicketIds]);

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

  const bulkAssignMutation = useMutation({
    mutationFn: (payload: BulkUpdateTicketFeaturePayload) => bulkUpdateTicketFeature(payload),
    onSuccess: async () => {
      clearSelection();
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
    tickets,
    pagination,
    featuresQuery,
    ticketsQuery,
    assignMutation,
    bulkAssignMutation,
    pageMetrics,
    selectedTicketIds,
    allVisibleSelected,
    selectedVisibleCount,
    visibleTicketIds,
    filterState: {
      featureId,
      status,
      showUnassigned,
      showMissing,
      page,
      limit,
      search: searchInput,
      assignee: assigneeInput,
      sortBy,
      sortOrder,
    },
    actions: {
      setFeatureId(nextFeatureId: string) {
        setPage(1);
        clearSelection();
        setFeatureId(nextFeatureId);
        if (nextFeatureId) {
          setShowUnassigned(false);
        }
      },
      setStatus(nextStatus: DevtrackStatus | "") {
        setPage(1);
        clearSelection();
        setStatus(nextStatus);
      },
      setShowUnassigned(checked: boolean) {
        setPage(1);
        clearSelection();
        setShowUnassigned(checked);
        if (checked) {
          setFeatureId("");
        }
      },
      setShowMissing(checked: boolean) {
        setPage(1);
        clearSelection();
        setShowMissing(checked);
      },
      setSearch(nextSearch: string) {
        setPage(1);
        clearSelection();
        setSearchInput(nextSearch);
      },
      setAssignee(nextAssignee: string) {
        setPage(1);
        clearSelection();
        setAssigneeInput(nextAssignee);
      },
      setSortBy(nextSortBy: TicketSortBy) {
        setPage(1);
        clearSelection();
        setSortBy(nextSortBy);
      },
      setSortOrder(nextSortOrder: SortOrder) {
        setPage(1);
        clearSelection();
        setSortOrder(nextSortOrder);
      },
      setLimit(nextLimit: number) {
        setPage(1);
        clearSelection();
        setLimit(nextLimit);
      },
      setPage(nextPage: number) {
        clearSelection();
        setPage(nextPage);
      },
      toggleTicketSelection(ticketId: string, checked: boolean) {
        setSelectedTicketIds((current) =>
          checked ? [...new Set([...current, ticketId])] : current.filter((id) => id !== ticketId),
        );
      },
      toggleSelectAllVisible(checked: boolean) {
        setSelectedTicketIds((current) => {
          if (!checked) {
            return current.filter((id) => !visibleTicketIds.includes(id));
          }

          return [...new Set([...current, ...visibleTicketIds])];
        });
      },
      clearSelection,
      assignTicket(ticketId: string, nextFeatureId: string | null) {
        assignMutation.mutate({ ticketId, nextFeatureId });
      },
      bulkAssignTickets(nextFeatureId: string | null) {
        if (!selectedTicketIds.length) {
          return;
        }

        bulkAssignMutation.mutate({
          ticketIds: selectedTicketIds,
          featureId: nextFeatureId,
        });
      },
    },
  };
}
