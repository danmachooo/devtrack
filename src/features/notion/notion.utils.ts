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

export function normalizeNotionDatabaseId(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  const hyphenatedMatch = trimmedValue.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/,
  );

  if (hyphenatedMatch) {
    return hyphenatedMatch[0].toLowerCase();
  }

  const compactMatch = trimmedValue.match(/[0-9a-fA-F]{32}/);

  if (!compactMatch) {
    return trimmedValue;
  }

  const compactId = compactMatch[0].toLowerCase();

  return [
    compactId.slice(0, 8),
    compactId.slice(8, 12),
    compactId.slice(12, 16),
    compactId.slice(16, 20),
    compactId.slice(20),
  ].join("-");
}
