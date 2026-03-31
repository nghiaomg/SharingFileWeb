import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createQRPayment, cancelPayment } from "./api";
import { paymentKeys } from "./queries";
import { authKeys } from "@/features/auth/queries";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/types/api";

export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQRPayment,
    onSuccess: () => {
      // Invalidate status so it fetches the new PENDING order and starts polling
      queryClient.invalidateQueries({ queryKey: paymentKeys.status() });
      toast.success("Khởi tạo thanh toán thành công. Vui lòng quét mã QR.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Tạo đơn thanh toán thất bại."));
    },
  });
}

export function useRefreshPaymentHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentKeys.history() });
    },
  });
}

export function useInvalidateUserAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: authKeys.all() });
    },
  });
}

export function useCancelPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.status() });
      toast.success("Đã hủy đơn hàng chờ thanh toán.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Không thể hủy đơn hàng."));
    },
  });
}
