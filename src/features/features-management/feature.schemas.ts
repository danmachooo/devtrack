import { z } from "zod";

export const createFeatureSchema = z.object({
  name: z.string().trim().min(2, "Feature name is required."),
});

export type CreateFeatureFormValues = z.infer<typeof createFeatureSchema>;

export const updateFeatureSchema = z.object({
  name: z.string().trim().min(2, "Feature name is required."),
});

export type UpdateFeatureFormValues = z.infer<typeof updateFeatureSchema>;
