import { z } from "zod";

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const AdminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  roles: z.array(RoleSchema),
  subscriptionPlan: z.string().optional(),
  maxStorage: z.number().optional(),
  maxFileSize: z.number().optional(),
  createdAt: z.string().optional(),
  lastLogin: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const UpdateAdminUserSchema = z.object({
  roles: z.array(z.string()).optional(),
  subscriptionPlan: z.string().optional(),
  maxStorage: z.number().optional(),
  maxFileSize: z.number().optional(),
});

export type UpdateAdminUser = z.infer<typeof UpdateAdminUserSchema>;

export interface AdminPaginatedUsersResponse {
  content: AdminUser[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
}
