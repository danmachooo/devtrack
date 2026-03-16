"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { getProjects } from "@/lib/api/projects.api";

const projectQueryParam = "projectId";

export function useTicketsWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get(projectQueryParam);

  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const projects = projectsQuery.data?.data ?? [];
  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? null;

  useEffect(() => {
    if (!projects.length) {
      return;
    }

    if (selectedProjectId && selectedProject) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set(projectQueryParam, projects[0].id);
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, projects, router, searchParams, selectedProject, selectedProjectId]);

  return {
    projectsQuery,
    projects,
    selectedProjectId,
    selectedProject,
    actions: {
      setSelectedProject(nextProjectId: string) {
        const params = new URLSearchParams(searchParams.toString());
        params.set(projectQueryParam, nextProjectId);
        router.replace(`${pathname}?${params.toString()}`);
      },
    },
  };
}
