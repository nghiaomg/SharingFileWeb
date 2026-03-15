import { z } from "zod";

export const DashboardCategorySchema = z.object({
  type: z.string(),
  count: z.number(),
  totalSize: z.number(),
});

export type DashboardCategory = z.infer<typeof DashboardCategorySchema>;

export const DashboardOverviewSchema = z.object({
  categories: z.array(DashboardCategorySchema),
  recentFiles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string().nullable(),
    size: z.number(),
    createdAt: z.string(),
  })),
});

export type DashboardOverview = z.infer<typeof DashboardOverviewSchema>;
