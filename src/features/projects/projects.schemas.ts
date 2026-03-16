import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  clientName: z.string().trim().min(2, "Client name is required."),
  clientEmail: z.email("Enter a valid client email."),
});

export type CreateProjectFormValues = z.infer<typeof createProjectSchema>;
