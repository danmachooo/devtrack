import { z } from "zod";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2, "Organization name is required."),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .max(100, "Slug must be 100 characters or fewer.")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only."),
  logo: z.union([z.url("Enter a valid logo URL."), z.literal("")]).optional(),
});

export type CreateOrganizationFormValues = z.infer<typeof createOrganizationSchema>;

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid teammate email."),
  role: z.enum(["BUSINESS_ANALYST", "QUALITY_ASSURANCE", "DEVELOPER"]),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
