"use client";

import { useQuery } from "@tanstack/react-query";

import { getSession } from "@/lib/api/auth.api";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
}
