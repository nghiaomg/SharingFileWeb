"use client";

import { useState } from "react";
import { useAdminOrders } from "../../hooks/useOrdersQuery";
import { useUpdateOrderStatus } from "../../hooks/useOrdersMutation";
import {
  Loader2,
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@radix-ui/themes";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-500 relative",
  COMPLETED: "bg-emerald-500/10 text-emerald-500",
  FAILED: "bg-red-500/10 text-red-500",
  CANCELLED: "bg-gray-500/10 text-gray-500",
  EXPIRED: "bg-orange-500/10 text-orange-500",
};

export function OrdersList() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const {
    data: pageData,
    isLoading,
    isError,
  } = useAdminOrders(page, statusFilter);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateOrderStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-6 bg-red-500/10 rounded-xl font-medium text-sm">
        Đã xảy ra lỗi khi tải danh sách Đơn Hàng. (Yêu cầu ROLE_ADMIN)
      </div>
    );
  }

  const orders = pageData?.orders || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {["ALL", "PENDING", "COMPLETED", "FAILED", "CANCELLED"].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setPage(0);
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === st
                ? "bg-primary text-primary-foreground "
                : "bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 border border-border"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-card rounded-xl border border-border p-4 space-y-4 animate-in fade-in zoom-in-95 duration-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg border border-border/50 shrink-0">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p
                    className="font-mono font-bold text-foreground text-sm uppercase"
                    title={order.orderId}
                  >
                    {order.orderId.length > 15
                      ? order.orderId.slice(0, 15) + "..."
                      : order.orderId}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase flex gap-1 mt-0.5">
                    <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 rounded">
                      {order.planName}
                    </span>
                    <span className="px-1.5 py-0.5 bg-secondary text-secondary-foreground rounded">
                      {order.paymentMethod}
                    </span>
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 font-bold text-[9px] rounded uppercase flex items-center justify-center shrink-0 ${
                  STATUS_COLORS[order.status] || "bg-gray-500/10 text-gray-500"
                }`}
              >
                {order.status === "PENDING" && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
                {order.status}
              </span>
            </div>

            <div className="bg-secondary/30 p-3 rounded-md grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Thành tiền:</p>
                <p className="font-bold text-foreground text-sm flex items-center">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(order.amount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Khách hàng UID:</p>
                <p
                  className="font-mono font-bold text-foreground"
                  title={order.userId}
                >
                  {order.userId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {order.createdAt
                ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")
                : "N/A"}
            </div>

            {order.status === "PENDING" && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border mt-2">
                <button
                  onClick={() => {
                    if (
                      confirm(`Chấp thuận bằng tay đơn hàng ${order.orderId}?`)
                    ) {
                      updateStatus(
                        { id: order.id, status: "COMPLETED" },
                        {
                          onSuccess: () =>
                            toast.success(
                              "Đã duyệt đơn hàng bằng tay thành công",
                            ),
                          onError: () => toast.error("Không thể duyệt đơn"),
                        },
                      );
                    }
                  }}
                  disabled={isUpdating}
                  className="py-2 flex items-center justify-center gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-colors font-semibold text-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                </button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        `Bạn có chắc chắn muốn HỦY đơn hàng ${order.orderId}?`,
                      )
                    ) {
                      updateStatus(
                        { id: order.id, status: "CANCELLED" },
                        {
                          onSuccess: () =>
                            toast.success("Đã đánh dấu đơn hàng HỦY"),
                          onError: () => toast.error("Có lỗi xảy ra khi Hủy"),
                        },
                      );
                    }
                  }}
                  disabled={isUpdating}
                  className="py-2 flex items-center justify-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors font-semibold text-xs disabled:opacity-50"
                >
                  <Ban className="w-3.5 h-3.5" /> Hủy
                </button>
              </div>
            )}
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center p-8 text-muted-foreground text-sm border border-dashed rounded-xl border-border">
            Bộ lọc trống. Không tìm thấy đơn hàng nào ở trạng thái{" "}
            {statusFilter}.
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Đơn (Order ID)</th>
                <th className="px-6 py-4 font-medium">Khách hàng / Gói</th>
                <th className="px-6 py-4 font-medium">Thành Tiền</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium">Ngày lập</th>
                <th className="px-6 py-4 font-medium text-right">
                  Phê duyệt (Manual)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg border border-border/50">
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p
                          className="font-mono font-bold text-foreground text-xs uppercase"
                          title={order.orderId}
                        >
                          {order.orderId.length > 15
                            ? order.orderId.slice(0, 15) + "..."
                            : order.orderId}
                        </p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className="text-xs font-mono text-muted-foreground mb-1"
                      title={order.userId}
                    >
                      UID: {order.userId.slice(0, 8)}...
                    </p>
                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 font-bold text-[10px] rounded uppercase">
                      {order.planName}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 font-bold text-[11px] rounded flex items-center justify-center w-max uppercase ${
                        STATUS_COLORS[order.status] ||
                        "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {order.status === "PENDING" && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      )}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-[11px] font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {order.createdAt
                        ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    {order.status === "PENDING" ? (
                      <>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `CHÚ Ý: Chấp thuận (COMPLETED) đơn hàng ${order.orderId} một cách thủ công? Gói cước của user sẽ được lập tức kích hoạt thay vì đợi hệ thống auto webhook.`,
                              )
                            ) {
                              updateStatus(
                                { id: order.id, status: "COMPLETED" },
                                {
                                  onSuccess: () =>
                                    toast.success(
                                      "Đã duyệt đơn hàng bằng tay thành công",
                                    ),
                                  onError: () =>
                                    toast.error("Không thể duyệt đơn"),
                                },
                              );
                            }
                          }}
                          disabled={isUpdating}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50"
                          title="Chấp thuận bằng tay (Duyệt nạp)"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc chắn muốn HỦY đơn hàng ${order.orderId}?`,
                              )
                            ) {
                              updateStatus(
                                { id: order.id, status: "CANCELLED" },
                                {
                                  onSuccess: () =>
                                    toast.success("Đã đánh dấu đơn hàng HỦY"),
                                  onError: () =>
                                    toast.error("Có lỗi xảy ra khi Hủy"),
                                },
                              );
                            }
                          }}
                          disabled={isUpdating}
                          className="px-3 py-1.5 flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50"
                          title="Từ chối đơn Hàng (Hủy)"
                        >
                          <Ban className="w-3.5 h-3.5" /> <span>Hủy</span>
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-bold italic py-2">
                        Đã Đóng
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr className="hidden md:table-row">
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Bộ lọc trống. Không tìm thấy đơn hàng nào ở trạng thái{" "}
                    {statusFilter}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pageData && pageData.totalPages > 0 && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <span className="text-xs text-muted-foreground font-medium flex gap-1">
              Trang <b>{pageData.currentPage + 1}</b> /{" "}
              <b>{pageData.totalPages}</b>
              &nbsp;|&nbsp; Tổng số: <b>{pageData.totalItems}</b> giao dịch
            </span>
            <div className="flex gap-2">
              <Button
                variant="soft"
                color="gray"
                size="2"
                disabled={page === 0 || isUpdating}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="w-4 h-4" /> Trước
              </Button>
              <Button
                variant="soft"
                color="gray"
                size="2"
                disabled={page >= pageData.totalPages - 1 || isUpdating}
                onClick={() => setPage((p) => p + 1)}
              >
                Sau <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
