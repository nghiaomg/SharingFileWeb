"use client";

import { OrdersList } from "@/features/admin/components/orders/OrdersList";
import { OrderStatsDisplay } from "@/features/admin/components/orders/OrderStats";

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Quản lý Đơn hàng (Orders & Payments)
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Giám sát dòng tiền và các giao dịch thanh toán nâng cấp Gói Cước trong
          ứng dụng. Cung cấp tính năng{" "}
          <b>Phê duyệt Thanh toán bằng tay (Manual Approve)</b> dành cho các
          trường hợp Khách hàng thanh toán qua Ngân Hàng/QR Code nhưng hệ thống
          bị gãy Webhook (ví dụ SEPAY hoặc VNPAY Delay).
        </p>
      </div>

      <OrderStatsDisplay />

      <OrdersList />
    </div>
  );
}
