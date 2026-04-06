"use client";

import { AdminOverview } from "@/features/admin/components/dashboard/AdminOverview";

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 text-foreground">
          Tổng quan Quản trị
        </h1>
        <p className="text-muted-foreground text-sm">
          Thống kê tình hình hoạt động của toàn bộ hệ thống FileFlow
        </p>
      </div>

      <AdminOverview />
    </div>
  );
}
