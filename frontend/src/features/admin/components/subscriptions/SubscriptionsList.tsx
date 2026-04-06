"use client";

import { useState } from "react";
import { useAdminSubscriptions } from "../../hooks/useSubscriptionsQuery";
import { useDeletePlan } from "../../hooks/useSubscriptionsMutation";
import {
  Loader2,
  Trash2,
  Edit,
  CreditCard,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { formatBytes } from "@/lib/format";
import { SubscriptionEditModal } from "./SubscriptionEditModal";
import { AdminSubscriptionPlan } from "../../types/subscriptions.types";
import { Button } from "@radix-ui/themes";

export function SubscriptionsList() {
  const { data: pageData, isLoading, isError } = useAdminSubscriptions();
  const { mutate: deletePlan, isPending: isDeleting } = useDeletePlan();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] =
    useState<AdminSubscriptionPlan | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-red-500 p-6 bg-red-500/10 rounded-xl">
        Đã xảy ra lỗi khi tải danh sách Packages. Vui lòng thử lại.
      </div>
    );
  }

  const plans = pageData?.content || [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end gap-3 flex-wrap">

        <Button
          size="3"
          onClick={() => {
            setSelectedPlan(null);
            setModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Tạo gói mới
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-card rounded-xl border border-border p-4 shadow-sm space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg border border-primary/20 shrink-0">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-base uppercase tracking-wider">
                    {plan.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {plan.durationDays} Ngày
                  </p>
                </div>
              </div>
              {plan.isActive ? (
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-[9px] rounded uppercase shrink-0">
                  Hoạt động
                </span>
              ) : (
                <span className="px-2 py-1 bg-gray-500/10 text-gray-500 font-bold text-[9px] rounded uppercase shrink-0">
                  Ngừng bán
                </span>
              )}
            </div>

            <div className="bg-secondary/30 rounded-md p-3">
              <p className="font-bold text-emerald-600 dark:text-emerald-400 text-lg mb-2">
                {plan.price === 0
                  ? "MIỄN PHÍ"
                  : new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(plan.price)}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Tổng dung lượng:</p>
                  <p className="font-bold text-foreground">
                    {formatBytes(plan.maxStorageBytes)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Giới hạn tệp:</p>
                  <p className="font-bold text-foreground">
                    {formatBytes(plan.maxFileSizeBytes)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2">Tính năng:</p>
              <div className="flex flex-wrap gap-1.5">
                {plan.features?.slice(0, 3).map((feat, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                  >
                    ✓ {feat}
                  </span>
                ))}
                {plan.features?.length > 3 && (
                  <span className="text-[10px] text-muted-foreground italic px-1 pt-1">
                    +{plan.features.length - 3} khác
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border mt-2">
              <button
                onClick={() => {
                  setSelectedPlan(plan);
                  setModalOpen(true);
                }}
                className="py-2 flex justify-center items-center gap-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors shadow-sm text-xs font-semibold"
              >
                <Edit className="w-3.5 h-3.5" /> Sửa gói
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      `CẢNH BÁO: Xóa gói "${plan.name}" có thể gây lỗi. Chọn hủy (Ngừng bán) an toàn hơn. CHẮC CHẮN MỐN XÓA CỨNG?`,
                    )
                  ) {
                    deletePlan(plan.id, {
                      onSuccess: () => toast.success("Đã xóa gói cước"),
                      onError: () => toast.error("Không thể xóa gói"),
                    });
                  }
                }}
                disabled={isDeleting}
                className="py-2 flex justify-center items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-sm text-xs font-semibold disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa cứng
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
              <tr>
                <th className="px-6 py-4 font-medium">Tên Gói</th>
                <th className="px-6 py-4 font-medium">Giá</th>
                <th className="px-6 py-4 font-medium">Dung lượng</th>
                <th className="px-6 py-4 font-medium">Tính năng</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-base uppercase tracking-wider">
                          {plan.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {plan.durationDays} Ngày
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                    {plan.price === 0
                      ? "MIỄN PHÍ"
                      : new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(plan.price)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm">
                      Tổng:{" "}
                      <span className="font-bold">
                        {formatBytes(plan.maxStorageBytes)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground border-t border-border mt-1 pt-1">
                      Giới hạn tệp: {formatBytes(plan.maxFileSizeBytes)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 max-w-[200px]">
                      {plan.features?.slice(0, 2).map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded truncate"
                          title={feat}
                        >
                          ✓ {feat}
                        </span>
                      ))}
                      {plan.features?.length > 2 && (
                        <span className="text-xs text-muted-foreground italic">
                          +{plan.features.length - 2} tính năng khác
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {plan.isActive ? (
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 font-bold text-[11px] rounded uppercase">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-500/10 text-gray-500 font-bold text-[11px] rounded uppercase">
                        Ngừng bán
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setSelectedPlan(plan);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors shadow-sm text-xs font-semibold"
                      title="Sửa cấu hình"
                    >
                      <Edit className="w-3.5 h-3.5" /> <span>Sửa gói</span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `CẢNH BÁO: Xóa gói "${plan.name}" (ID: ${plan.id}) sẽ khiến các User đang sở hữu gói này bị lỗi logic khi hết hạn. Lời khuyên là nên Chuyển trạng thái sang Ngừng Bán (isActive = false) thay vì XÓA CỨNG. Bạn có CHẮC CHẮN MUỐN XÓA CỨNG?`,
                          )
                        ) {
                          deletePlan(plan.id, {
                            onSuccess: () => toast.success("Đã xóa gói cước"),
                            onError: () => toast.error("Không thể xóa gói"),
                          });
                        }
                      }}
                      disabled={isDeleting}
                      className="px-3 py-1.5 flex items-center gap-1.5 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors shadow-sm text-xs font-semibold disabled:opacity-50"
                      title="Xóa vĩnh viễn"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> <span>Xóa cứng</span>
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr className="hidden md:table-row">
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    Chưa có cấu hình gói cước (Packages) nào. Bấm Khởi tạo (Init
                    Default) ở góc trên để thêm bộ 03 gói mặc định!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SubscriptionEditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlan}
      />
    </div>
  );
}
