"use client";

import { useAdminOrderStats } from "../../hooks/useOrdersQuery";
import { DollarSign, ShoppingCart, CheckCircle, XCircle } from "lucide-react";

export function OrderStatsDisplay() {
  const { data: stats, isLoading, isError } = useAdminOrderStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-muted/20 animate-pulse rounded-xl border border-border"
          ></div>
        ))}
      </div>
    );
  }

  if (isError || !stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground font-medium">
            Tổng Doanh Thu
          </p>
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(stats.totalRevenue)}
        </h3>
      </div>

      <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground font-medium">
            Tổng Đơn Hàng
          </p>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <ShoppingCart className="w-4 h-4 text-blue-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          {stats.totalOrders}
        </h3>
      </div>

      <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground font-medium">
            Hoàn Thành (COMPLETED)
          </p>
          <div className="p-2 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          {stats.completedOrders}
        </h3>
      </div>

      <div className="bg-card p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-muted-foreground font-medium">
            Thất Bại (FAILED)
          </p>
          <div className="p-2 bg-red-500/10 rounded-lg">
            <XCircle className="w-4 h-4 text-red-500" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          {stats.failedOrders}
        </h3>
      </div>
    </div>
  );
}
