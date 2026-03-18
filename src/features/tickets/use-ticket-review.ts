"use client";

import {
  keepPreviousData,
  type QueryKey,
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
  ApiResponse,
  BulkUpdateTicketFeaturePayload,
  DevtrackStatus,
  GetProjectTicketsQuery,
  ProjectFeatureSummary,
  SortOrder,
  Ticket,
  TicketFeatureReference,
  TicketSortBy,
  TicketListData,
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
    setFeatureId("");
    setStatus("");
    setShowUnassigned(options.canAssignTickets);
    setShowMissing(false);
    setSelectedTicketIds([]);
    setPage(1);
    setSearchInput("");
    setAssigneeInput("");
    setSortBy("syncedAt");
    setSortOrder("desc");
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
    onMutate: async ({ ticketId, nextFeatureId }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["project", projectId, "tickets"] }),
        queryClient.cancelQueries({ queryKey: ["project", projectId, "features"] }),
      ]);

      const previousTicketQueries = queryClient.getQueriesData<ApiResponse<TicketListData>>({
        queryKey: ["project", projectId, "tickets"],
      });
      const previousFeatures = queryClient.getQueryData<ApiResponse<ProjectFeatureSummary[]>>([
        "project",
        projectId,
        "features",
      ]);
      const cachedTicket = findCachedTicketById(previousTicketQueries, ticketId);

      if (!cachedTicket) {
        return {
          projectId,
          previousFeatures,
          previousTicketQueries,
        };
      }

      const optimisticTicket = buildPatchedTicket(
        cachedTicket,
        nextFeatureId,
        buildFeatureReference(previousFeatures?.data ?? [], nextFeatureId),
      );

      syncTicketQueries(queryClient, projectId, [optimisticTicket]);
      syncFeatureCounts(queryClient, projectId, [
        {
          previousFeatureId: cachedTicket.featureId,
          nextFeatureId,
        },
      ]);

      return {
        projectId,
        previousFeatures,
        previousTicketQueries,
      };
    },
    onError: (_error, _variables, context) => {
      restoreTicketReviewCaches(queryClient, context);
    },
    onSuccess: (response) => {
      syncTicketQueries(queryClient, projectId, [response.data]);
    },
  });

  const bulkAssignMutation = useMutation({
    mutationFn: (payload: BulkUpdateTicketFeaturePayload) => bulkUpdateTicketFeature(payload),
    onMutate: async (payload) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: ["project", projectId, "tickets"] }),
        queryClient.cancelQueries({ queryKey: ["project", projectId, "features"] }),
      ]);

      const previousTicketQueries = queryClient.getQueriesData<ApiResponse<TicketListData>>({
        queryKey: ["project", projectId, "tickets"],
      });
      const previousFeatures = queryClient.getQueryData<ApiResponse<ProjectFeatureSummary[]>>([
        "project",
        projectId,
        "features",
      ]);
      const cachedTickets = payload.ticketIds
        .map((ticketId) => findCachedTicketById(previousTicketQueries, ticketId))
        .filter((ticket): ticket is Ticket => Boolean(ticket));

      if (!cachedTickets.length) {
        return {
          projectId,
          previousFeatures,
          previousTicketQueries,
        };
      }

      const nextFeature = buildFeatureReference(previousFeatures?.data ?? [], payload.featureId);
      const optimisticTickets = cachedTickets.map((ticket) =>
        buildPatchedTicket(ticket, payload.featureId, nextFeature),
      );

      syncTicketQueries(queryClient, projectId, optimisticTickets);
      syncFeatureCounts(
        queryClient,
        projectId,
        cachedTickets.map((ticket) => ({
          previousFeatureId: ticket.featureId,
          nextFeatureId: payload.featureId,
        })),
      );

      return {
        projectId,
        previousFeatures,
        previousTicketQueries,
      };
    },
    onError: (_error, _variables, context) => {
      restoreTicketReviewCaches(queryClient, context);
    },
    onSuccess: (response) => {
      clearSelection();
      syncTicketQueries(queryClient, projectId, response.data.tickets);
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

type TicketReviewMutationContext = {
  projectId: string;
  previousFeatures: ApiResponse<ProjectFeatureSummary[]> | undefined;
  previousTicketQueries: Array<[QueryKey, ApiResponse<TicketListData> | undefined]>;
};

type FeatureCountTransition = {
  previousFeatureId: string | null;
  nextFeatureId: string | null;
};

function restoreTicketReviewCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  context: TicketReviewMutationContext | undefined,
) {
  if (!context) {
    return;
  }

  queryClient.setQueryData(
    ["project", context.projectId, "features"],
    context.previousFeatures,
  );

  context.previousTicketQueries.forEach(([queryKey, data]) => {
    queryClient.setQueryData(queryKey, data);
  });
}

function findCachedTicketById(
  queryEntries: Array<[QueryKey, ApiResponse<TicketListData> | undefined]>,
  ticketId: string,
) {
  for (const [, queryData] of queryEntries) {
    const cachedTicket = queryData?.data.items.find((ticket) => ticket.id === ticketId);

    if (cachedTicket) {
      return cachedTicket;
    }
  }

  return null;
}

function buildFeatureReference(
  features: ProjectFeatureSummary[],
  featureId: string | null,
): TicketFeatureReference | null {
  if (!featureId) {
    return null;
  }

  const feature = features.find((item) => item.id === featureId);

  if (!feature) {
    return null;
  }

  return {
    id: feature.id,
    name: feature.name,
    order: feature.order,
  };
}

function buildPatchedTicket(
  ticket: Ticket,
  nextFeatureId: string | null,
  nextFeature: TicketFeatureReference | null,
): Ticket {
  return {
    ...ticket,
    featureId: nextFeatureId,
    feature: nextFeature,
  };
}

function syncTicketQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  tickets: Ticket[],
) {
  const updatedTicketsById = new Map(tickets.map((ticket) => [ticket.id, ticket]));

  queryClient.setQueriesData<ApiResponse<TicketListData>>(
    { queryKey: ["project", projectId, "tickets"] },
    (current) => {
      if (!current) {
        return current;
      }

      let didChange = false;
      const nextItems = current.data.items.map((ticket) => {
        const updatedTicket = updatedTicketsById.get(ticket.id);

        if (!updatedTicket) {
          return ticket;
        }

        didChange = true;
        return updatedTicket;
      });

      if (!didChange) {
        return current;
      }

      return {
        ...current,
        data: {
          ...current.data,
          items: nextItems,
        },
      };
    },
  );
}

function syncFeatureCounts(
  queryClient: ReturnType<typeof useQueryClient>,
  projectId: string,
  transitions: FeatureCountTransition[],
) {
  const countDeltas = new Map<string, number>();

  transitions.forEach(({ previousFeatureId, nextFeatureId }) => {
    if (previousFeatureId === nextFeatureId) {
      return;
    }

    if (previousFeatureId) {
      countDeltas.set(previousFeatureId, (countDeltas.get(previousFeatureId) ?? 0) - 1);
    }

    if (nextFeatureId) {
      countDeltas.set(nextFeatureId, (countDeltas.get(nextFeatureId) ?? 0) + 1);
    }
  });

  if (!countDeltas.size) {
    return;
  }

  queryClient.setQueryData<ApiResponse<ProjectFeatureSummary[]>>(
    ["project", projectId, "features"],
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        data: current.data.map((feature) => {
          const delta = countDeltas.get(feature.id);

          if (!delta) {
            return feature;
          }

          return {
            ...feature,
            _count: {
              ...feature._count,
              tickets: Math.max(0, feature._count.tickets + delta),
            },
          };
        }),
      };
    },
  );
}
