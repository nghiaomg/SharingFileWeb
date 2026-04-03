import React from "react";
import { format } from "date-fns";
import { useOrdersStore } from "../stores/orders.store";
import { useOrdersQuery } from "../hooks/useOrdersQuery";
import { useUpdateOrderMutation } from "../hooks/useUpdateOrderMutation";
import { X } from "lucide-react";
import { toast } from "sonner";

export const OrderDetailsModal = () => {
  const { isDetailsModalOpen, selectedOrderId, closeDetailsModal, filters } =
    useOrdersStore();
  const { data } = useOrdersQuery(filters);
  const { mutate: updateOrder, isPending } = useUpdateOrderMutation();

  if (!isDetailsModalOpen || !selectedOrderId) return null;

  // Optimistically find order from list (since we only show modal for listed items)
  const order = data?.orders.find((o) => o.id === selectedOrderId);

  if (!order) return null;

  const handleUpdateStatus = (newStatus: string) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn chuyển trạng thái đơn hàng này thành ${newStatus}?`,
      )
    )
      return;

    updateOrder(
      { id: order.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái đơn hàng thành công");
          closeDetailsModal();
        },
        onError: () => {
          toast.error("Có lỗi xảy ra khi cập nhật đơn hàng");
        },
      },
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/90 transition-opacity backdrop-blur-sm"
          aria-hidden="true"
          onClick={closeDetailsModal}
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100 dark:border-gray-700">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3
                className="text-xl leading-6 font-bold text-gray-900 dark:text-white"
                id="modal-title"
              >
                Chi tiết Đơn hàng
              </h3>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-500 transition-colors bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2 space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    Mã Đơn
                  </p>
                  <p className="text-lg font-mono font-bold text-gray-900 dark:text-white mt-1">
                    {order.orderCode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    Tình trạng
                  </p>
                  <p
                    className={`text-sm font-bold mt-1 ${
                      order.status === "PENDING"
                        ? "text-yellow-600"
                        : order.status === "CONFIRMED"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {order.status}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Người dùng (ID)
                  </p>
                  <p
                    className="text-sm font-medium text-gray-900 dark:text-white truncate"
                    title={order.userId}
                  >
                    {order.userId}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gói đăng ký
                  </p>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {order.planName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Số tiền
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.amount)}
                  </p>
                </div>
                {order.transactionId && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Mã giao dịch
                    </p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-block">
                      {order.transactionId}
                    </p>
                  </div>
                )}
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Ngày tạo:</span>
                  <span className="font-medium">
                    {format(new Date(order.createdAt), "HH:mm:ss dd/MM/yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ngày hết hạn:</span>
                  <span className="font-medium text-red-500">
                    {format(new Date(order.expiredAt), "HH:mm:ss dd/MM/yyyy")}
                  </span>
                </div>
                {order.confirmedAt && (
                  <div className="flex justify-between">
                    <span>Ngày duyệt:</span>
                    <span className="font-medium text-green-600">
                      {format(
                        new Date(order.confirmedAt),
                        "HH:mm:ss dd/MM/yyyy",
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/80 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2 border-t border-gray-100 dark:border-gray-700">
            {order.status === "PENDING" && (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                  onClick={() => handleUpdateStatus("CONFIRMED")}
                  disabled={isPending}
                >
                  {isPending ? "Đang xử lý..." : "Duyệt đơn"}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors disabled:opacity-50"
                  onClick={() => handleUpdateStatus("EXPIRED")}
                  disabled={isPending}
                >
                  Huỷ đơn
                </button>
              </>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
              onClick={closeDetailsModal}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
