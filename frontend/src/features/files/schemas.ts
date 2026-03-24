import { z } from "zod";

// ─── File ────────────────────────────────────────────────────────────────────
export const FileSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string().nullable(),
  size: z.number(),
  folderId: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  accessMode: z.string().optional(),
  sharedEmails: z.array(z.string()).optional(),
  shareExpiresAt: z.string().optional().nullable(),
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

// ─── Share File ──────────────────────────────────────────────────────────────
export const ShareFileSchema = z.object({
  accessMode: z.enum(["PRIVATE", "PUBLIC", "RESTRICTED"]),
  sharedEmails: z.array(z.string().email("Email không hợp lệ")).optional(),
  expiresInDays: z.number().nullable().optional(),
});

export type ShareFileInput = z.infer<typeof ShareFileSchema>;

// ─── Share Link ──────────────────────────────────────────────────────────────
export const ShareLinkSchema = z.object({
  id: z.string(),
  token: z.string(),
  fullUrl: z.string(),
  permission: z.string(),
  hasPassword: z.boolean(),
  expiresAt: z.string().nullable().optional(),
  isRevoked: z.boolean(),
  createdAt: z.string(),
});

export type ShareLinkItem = z.infer<typeof ShareLinkSchema>;

// ─── Shared Access ───────────────────────────────────────────────────────────
export const SharedAccessSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number(),
  ownerEmail: z.string(),
  recipientEmail: z.string(),
  permission: z.string(),
  createdAt: z.string(),
});

export type SharedAccessItem = z.infer<typeof SharedAccessSchema>;

// ─── Notification ────────────────────────────────────────────────────────────
export const NotificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export type NotificationItem = z.infer<typeof NotificationSchema>;

// ─── Create Share Link Input ─────────────────────────────────────────────────
export const CreateShareLinkSchema = z.object({
  fileId: z.string(),
  permission: z.enum(["VIEW", "DOWNLOAD"]),
  password: z.string().optional().nullable(),
  expiresInDays: z.number().optional().nullable(),
});

export type CreateShareLinkInput = z.infer<typeof CreateShareLinkSchema>;

// ─── Update Share Link Input ─────────────────────────────────────────────────
export const UpdateShareLinkSchema = z.object({
  permission: z.enum(["VIEW", "DOWNLOAD"]).optional(),
  password: z.string().optional().nullable(), // empty string to remove, null to ignore
  expiresInDays: z.number().optional().nullable(), // -1 to remove expiry, null to ignore
});

export type UpdateShareLinkInput = z.infer<typeof UpdateShareLinkSchema>;


// ─── Internal Share Input ────────────────────────────────────────────────────
export const InternalShareSchema = z.object({
  fileId: z.string(),
  emails: z.array(z.string().email()),
  permission: z.enum(["VIEW", "DOWNLOAD"]),
});

export type InternalShareInput = z.infer<typeof InternalShareSchema>;
