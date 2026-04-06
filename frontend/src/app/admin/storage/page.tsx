"use client";

import { AdminStorageExplorer } from "@/features/admin/components/storage/AdminStorageExplorer";

export default function AdminStoragePage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Quản lý Storage
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Quản lý toàn bộ thư mục và tệp tin của người dùng. Admin có quyền đổi
          tên, xem thông tin hoặc <b>Thu hồi (Revoke)</b> tệp tin/thư mục vi
          phạm quy định nội dung.
        </p>
      </div>

      <AdminStorageExplorer />
    </div>
  );
}
