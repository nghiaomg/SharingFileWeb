"use client";

import { SubscriptionsList } from "@/features/admin/components/subscriptions/SubscriptionsList";

export default function AdminSubscriptionsPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Cấu hình Gói Cước & Dung lượng (Packages)
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Quản lý các Gói Dịch Vụ và Bảng Giá của ứng dụng. Gói <b>BASIC</b>{" "}
          (hoặc tương đương Giá = 0) là gói được áp dụng mặc định khi người dùng
          mới tạo tài khoản. Không nên Xóa gói mà chỉ nên đổi trạng thái{" "}
          <b>Ngừng bán</b> để tránh thất thoát dữ liệu lịch sử thanh toán người
          dùng.
        </p>
      </div>

      <SubscriptionsList />
    </div>
  );
}
