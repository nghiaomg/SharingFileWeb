"use client";

import { NotificationsList } from "@/features/admin/components/notifications/NotificationsList";

export default function AdminNotificationsPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Giao thức Thông Báo (Notifications DB)
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Kiểm toán toàn bộ dòng chảy gửi Thông Báo Hệ Thống trên DB. Sử dụng{" "}
          <b>Giao thức Broadcast</b> để đẩy thông báo thủ công (Khuyến mãi, Cảnh
          báo nâng cấp) đến một tài khoản Email cụ thể hoặc bắn trên góc màn
          hình cho toàn bộ Users (Toàn hệ thống).
        </p>
      </div>

      <NotificationsList />
    </div>
  );
}
