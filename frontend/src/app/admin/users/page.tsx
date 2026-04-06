"use client";

import { UsersList } from "@/features/admin/components/users/UsersList";

export default function AdminUsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Danh sách tất cả tài khoản hoạt động trên hệ thống
          </p>
        </div>
      </div>

      <UsersList />
    </div>
  );
}
