import { z } from "zod";

// ─── User ────────────────────────────────────────────────────────────────────
export const UserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  username: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
  subscriptionPlan: z.string().optional(),
  maxStorage: z.number().optional(),
  maxFileSize: z.number().optional(),
  createdAt: z.string().optional(),
  lastLogin: z.string().optional(),
  twoFactorEnabled: z.boolean().optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  tokenType: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// ─── Login ───────────────────────────────────────────────────────────────────
export const LoginInputSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  turnstileToken: z.string().min(1, "Vui lòng xác minh Captcha"),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

// ─── Signup ──────────────────────────────────────────────────────────────────
export const SignupInputSchema = z.object({
  username: z.string().min(1, "Tên đăng nhập không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
  turnstileToken: z.string().min(1, "Vui lòng xác minh Captcha"),
});

export type SignupInput = z.infer<typeof SignupInputSchema>;

// ─── Update Profile ──────────────────────────────────────────────────────────
export const UpdateProfileSchema = z.object({
  email: z.string().email(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ─── Storage Usage ───────────────────────────────────────────────────────────
export const StorageUsageSchema = z.object({
  usedStorage: z.number(),
});

export type StorageUsage = z.infer<typeof StorageUsageSchema>;

// ─── Change Password ────────────────────────────────────────────────────────
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;
