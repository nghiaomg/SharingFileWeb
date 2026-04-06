"use client";

import { FilesList } from "@/features/admin/components/files/FilesList";

export default function AdminFilesPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Kiểm soát Tệp Hệ thống (Storage)
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Giám sát danh mục toàn bộ Files đang lưu trữ trên hệ thống Cloud
          Server & Backblaze B2. Admin có quyền{" "}
          <b>Tiêu hủy (Permanent Delete)</b> bất kỳ file nào vi phạm chính sách
          nội dung (Bản quyền lậu/Virus) mà không cần cảnh báo.
        </p>
      </div>

      <FilesList />
    </div>
  );
}
