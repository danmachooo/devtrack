"use client";

import { useQuery } from "@tanstack/react-query";

import { getClientDashboard } from "@/lib/api/client.api";

export function useClientDashboard(token: string) {
  return useQuery({
    queryKey: ["client-dashboard", token],
    queryFn: () => getClientDashboard(token),
    enabled: Boolean(token),
    retry: 1,
  });
}
