import { z } from "zod";

// ─── Plans ───────────────────────────────────────────────────────────────────
export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  storage: z.string(),
  storageBytes: z.number(),
  features: z.array(z.string()),
  recommended: z.boolean().optional(),
});

export type Plan = z.infer<typeof PlanSchema>;

// ─── QR Payment ──────────────────────────────────────────────────────────────
export const CreatePaymentSchema = z.object({
  planName: z.string().min(1, "Vui lòng chọn gói thanh toán"),
});

export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>;

// ─── Payment Result ──────────────────────────────────────────────────────────
export const PaymentResultSchema = z.object({
  id: z.string(),
  orderCode: z.string(),
  planName: z.string(),
  amount: z.number(),
  status: z.enum(["PENDING", "CONFIRMED", "EXPIRED"]),
  qrUrl: z.string(),
  createdAt: z.string(),
  expiredAt: z.string(),
});

export type PaymentResult = z.infer<typeof PaymentResultSchema>;
