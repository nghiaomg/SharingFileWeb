import { z } from 'zod';

export interface Role {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  roles: Role[];
  subscriptionPlan: string;
  maxStorage: number;
  maxFileSize: number;
  createdAt: string;
  lastLogin?: string;
  twoFactorEnabled: boolean;
}

export const updateUserSchema = z.object({
  roles: z.array(z.string()).min(1, 'Phải có ít nhất 1 role'),
  subscriptionPlan: z.string(),
  maxStorage: z.number().min(0, 'Dung lượng không hợp lệ'),
  maxFileSize: z.number().min(0, 'Dung lượng file không hợp lệ'),
});

export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
