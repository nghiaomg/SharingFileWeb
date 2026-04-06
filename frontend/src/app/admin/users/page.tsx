"use client";

import { UsersList } from "@/features/admin/components/users/UsersList";
import { UserPlus } from "lucide-react";

export default function AdminUsersPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Quản lý người dùng</h1>
                    <p className="text-sm text-muted-foreground mt-1">Danh sách tất cả tài khoản hoạt động trên hệ thống</p>
                </div>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Thêm User (Dev)</span>
                </button>
            </div>

            <UsersList />
        </div>
    );
}
