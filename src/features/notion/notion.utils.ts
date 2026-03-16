import type { DevtrackStatus, Project } from "@/types/api";
import type { NotionStatusMappingFormValues } from "@/features/notion/notion.schemas";

export function deriveMappingFormValues(project: Project): NotionStatusMappingFormValues {
  const entries = Object.entries(project.statusMapping ?? {});
  const values: NotionStatusMappingFormValues = {
    notStarted: "",
    inDev: "",
    approved: "",
    released: "",
  };

  for (const [source, target] of entries) {
    if (target === "NOT_STARTED") {
      values.notStarted = source;
    }

    if (target === "IN_DEV") {
      values.inDev = source;
    }

    if (target === "APPROVED") {
      values.approved = source;
    }

    if (target === "RELEASED") {
      values.released = source;
    }
  }

  return values;
}

export function buildStatusMappingPayload(values: NotionStatusMappingFormValues) {
  const mapping: Record<string, DevtrackStatus> = {};

  if (values.notStarted) {
    mapping[values.notStarted] = "NOT_STARTED";
  }

  if (values.inDev) {
    mapping[values.inDev] = "IN_DEV";
  }

  if (values.approved) {
    mapping[values.approved] = "APPROVED";
  }

  if (values.released) {
    mapping[values.released] = "RELEASED";
  }

  return mapping;
}

export function formatTargetLabel(target: string) {
  return target
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
