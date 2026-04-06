"use client";

import { FoldersList } from "@/features/admin/components/folders/FoldersList";

export default function AdminFoldersPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Kiểm soát Thư mục System
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Quản lý toàn bộ hệ thống lưu trữ File phân tầng theo Dạng cây. Khi
          Admin tiến hành <b>Tiêu hủy</b> một thư mục, hệ thống sẽ tự động tìm
          quét (Cascade) và dọn sạch vĩnh viễn toàn bộ file/folder con nằm bên
          trong nó trên Cloud Server & B2 Backblaze.
        </p>
      </div>

      <FoldersList />
    </div>
  );
}
