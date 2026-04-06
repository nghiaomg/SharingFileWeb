"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
            <AlertCircle className="w-20 h-20 text-red-500 mb-6" />
            <h1 className="text-7xl font-extrabold mb-2 tracking-tighter text-foreground">404</h1>
            <h2 className="text-2xl font-bold mb-4 text-muted-foreground">Không tìm phân vùng truy cập</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-md">
                Trang bạn đang tìm kiếm không tồn tại, đã bị xóa, hoặc bạn <strong>chưa đủ quyền</strong> để truy cập vào khu vực Quản trị (Admin) này.
            </p>
            <Link
                href="/dashboard"
                className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl transition-colors hover:bg-primary/90 flex items-center gap-2"
            >
                Trở về không gian cá nhân
            </Link>
        </div>
    );
}
