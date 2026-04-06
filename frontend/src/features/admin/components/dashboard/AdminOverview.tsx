"use client";

import {
  useAdminOverview,
  useAdminCategories,
} from "../../hooks/useDashboardQuery";
import {
  Loader2,
  Users,
  File,
  HardDrive,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { formatBytes } from "@/lib/format";

// Util format currency if not exists
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function AdminOverview() {
  const { data: overview, isLoading: loadingOverview } = useAdminOverview();
  const { data: categories, isLoading: loadingCats } = useAdminCategories();

  if (loadingOverview || loadingCats) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const computedTotalFiles =
    overview?.totalFiles ||
    categories?.reduce((acc, cat) => acc + cat.count, 0) ||
    0;
  const computedStorage =
    overview?.totalStorageBytes ||
    categories?.reduce((acc, cat) => acc + cat.size, 0) ||
    0;

  const statCards = [
    {
      title: "Tổng Users",
      value: overview?.totalUsers?.toLocaleString() || "Chưa có",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "File đã tải lên",
      value: computedTotalFiles.toLocaleString(),
      icon: File,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      title: "Dung lượng Cloud",
      value: formatBytes(computedStorage),
      icon: HardDrive,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Tổng Doanh thu",
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: Banknote,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group"
          >
            <div
              className={`p-4 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}
            >
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {!overview?.totalUsers && (!categories || categories.length === 0) && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          Đang hiển thị dữ liệu Offline Fallback. (Yêu cầu trỏ Backend API
          `/admin-overview` để lấy 100% dữ liệu thực)
        </div>
      )}
    </div>
  );
}
