import apiClient from "@/lib/api-client";
import type { CreatePaymentInput, PaymentResult } from "./schemas";

// ─── Create QR Payment ───────────────────────────────────────────────────────
export async function createQRPayment(
  data: CreatePaymentInput,
): Promise<PaymentResult> {
  const response = await apiClient.post<PaymentResult>("/payment/create", data);
  return response.data;
}

// ─── Check Payment Status ────────────────────────────────────────────────────
export async function checkPaymentStatus(): Promise<PaymentResult | null> {
  const response = await apiClient.get<PaymentResult | null>("/payment/status");
  return response.data;
}

// ─── Get Payment History ──────────────────────────────────────────────────────
export async function getPaymentHistory(): Promise<PaymentResult[]> {
  const response = await apiClient.get<PaymentResult[]>("/payment/history");
  return response.data;
}

// ─── Cancel Payment Order ────────────────────────────────────────────────────
export async function cancelPayment(): Promise<void> {
  const response = await apiClient.post("/payment/cancel");
  return response.data;
}
