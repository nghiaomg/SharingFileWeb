import { z } from "zod";

export const TrashFolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  deletedAt: z.string().optional(),
});

export type TrashFolder = z.infer<typeof TrashFolderSchema>;

export const TrashFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.number(),
  deletedAt: z.string().optional(),
});

export type TrashFile = z.infer<typeof TrashFileSchema>;

export const TrashDataSchema = z.object({
  folders: z.array(TrashFolderSchema),
  files: z.array(TrashFileSchema),
});

export type TrashData = z.infer<typeof TrashDataSchema>;
