import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  clientName: z.string().trim().min(2, "Client name is required."),
  clientEmail: z.email("Enter a valid client email."),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  clientName: z.string().trim().min(2, "Client name is required."),
  clientEmail: z.email("Enter a valid client email."),
  syncInterval: z
    .string()
    .trim()
    .refine((value) => value === "" || (/^\d+$/.test(value) && Number(value) >= 5 && Number(value) <= 60), {
      message: "Sync interval must be between 5 and 60 minutes.",
    })
    .optional(),
});

export type UpdateProjectFormValues = z.infer<typeof updateProjectSchema>;
