"use client";

import { SharesList } from "@/features/admin/components/shares/SharesList";

export default function AdminSharesPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Kiểm soát Share Links (tất cả)
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Quản lý toàn bộ các đường liên kết (URL) được người dùng chia sẻ công
          khai (Public) ra bên ngoài mạng Internet. Admin có quyền{" "}
          <b>Khóa và Cấm (Ban)</b> các đường link chia sẻ file lậu, vi phạm bản
          quyền, băng thông cao hoặc mã độc để dập tắt lưu lượng truy cập ngay
          lập tức khỏi Server B2.
        </p>
      </div>

      <SharesList />
    </div>
  );
}
