import { z } from "zod";

// ─── File ────────────────────────────────────────────────────────────────────
export const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().nullable(),
  size: z.number(),
  folderId: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional().nullable(),
});

export type FileItem = z.infer<typeof FileSchema>;

// ─── Folder ──────────────────────────────────────────────────────────────────
export const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  parentId: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deletedAt: z.string().optional().nullable(),
});

export type FolderItem = z.infer<typeof FolderSchema>;

// ─── Folder Children ─────────────────────────────────────────────────────────
export const FolderChildrenSchema = z.object({
  folders: z.array(FolderSchema),
  files: z.array(FileSchema),
});

export type FolderChildren = z.infer<typeof FolderChildrenSchema>;

// ─── Create / Update Folder ──────────────────────────────────────────────────
export const CreateFolderSchema = z.object({
  name: z.string().min(1, "Tên thư mục không được để trống"),
  parentId: z.string().nullable().optional(),
});

export type CreateFolderInput = z.infer<typeof CreateFolderSchema>;

export const UpdateFolderSchema = z.object({
  name: z.string().min(1, "Tên thư mục không được để trống"),
});

export type UpdateFolderInput = z.infer<typeof UpdateFolderSchema>;
