import { z } from "zod";

export const DashboardCategorySchema = z.object({
  title: z.string(),
  files: z.number(),
  size: z.number(),
});

export type DashboardCategory = z.infer<typeof DashboardCategorySchema>;

export const RecentFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().nullable(),
  size: z.number(),
  createdAt: z.string(),
});

export type RecentFile = z.infer<typeof RecentFileSchema>;
