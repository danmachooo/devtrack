import { z } from "zod";

const notionDatabaseIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const notionConnectionSchema = z.object({
  notionToken: z.string().trim().min(1, "Notion token is required."),
  databaseId: z
    .string()
    .trim()
    .regex(notionDatabaseIdPattern, "Enter a valid Notion database ID."),
});

export type NotionConnectionFormValues = z.infer<typeof notionConnectionSchema>;

export const notionStatusMappingSchema = z
  .object({
    notStarted: z.string().trim().optional(),
    inDev: z.string().trim().optional(),
    approved: z.string().trim().optional(),
    released: z.string().trim().optional(),
  })
  .refine(
    (value) =>
      Boolean(value.notStarted || value.inDev || value.approved || value.released),
    {
      message: "Add at least one status mapping entry before saving.",
      path: ["notStarted"],
    },
  );

export type NotionStatusMappingFormValues = z.infer<typeof notionStatusMappingSchema>;
