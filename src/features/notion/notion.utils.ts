import type { DevtrackStatus, Project } from "@/types/api";
import type { NotionStatusMappingFormValues } from "@/features/notion/notion.schemas";

export function deriveMappingFormValues(project: Project): NotionStatusMappingFormValues {
  const entries = Object.entries(project.statusMapping ?? {});
  const values: NotionStatusMappingFormValues = {
    todo: "",
    inDev: "",
    qa: "",
    approved: "",
    released: "",
    blocked: "",
  };

  for (const [source, target] of entries) {
    if (target === "TODO") {
      values.todo = source;
    }

    if (target === "IN_DEV") {
      values.inDev = source;
    }

    if (target === "QA") {
      values.qa = source;
    }

    if (target === "APPROVED") {
      values.approved = source;
    }

    if (target === "RELEASED") {
      values.released = source;
    }

    if (target === "BLOCKED") {
      values.blocked = source;
    }
  }

  return values;
}

export function buildStatusMappingPayload(values: NotionStatusMappingFormValues) {
  const mapping: Record<string, DevtrackStatus> = {};

  if (values.todo) {
    mapping[values.todo] = "TODO";
  }

  if (values.inDev) {
    mapping[values.inDev] = "IN_DEV";
  }

  if (values.qa) {
    mapping[values.qa] = "QA";
  }

  if (values.approved) {
    mapping[values.approved] = "APPROVED";
  }

  if (values.released) {
    mapping[values.released] = "RELEASED";
  }

  if (values.blocked) {
    mapping[values.blocked] = "BLOCKED";
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
