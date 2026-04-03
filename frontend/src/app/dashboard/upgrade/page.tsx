"use client";

import {
  Zap,
  Shield,
  HardDrive,
  Infinity,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreatePaymentMutation } from "@/features/payment/mutations";
import { usePaymentStatusQuery } from "@/features/payment/queries";
import { useCurrentUser } from "@/features/auth/queries";

export default function UpgradePage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();

  // Payment Status polling
  const { data: paymentStatus } = usePaymentStatusQuery();

  // Create new payment order mutation
  const createPaymentMutation = useCreatePaymentMutation();

  const isPro = user?.subscriptionPlan === "PRO";
  const pendingOrder =
    paymentStatus?.status === "PENDING" ? paymentStatus : null;

  const handleUpgradeClick = async () => {
    if (pendingOrder) {
      router.push(`/payment/checkout/${pendingOrder.orderCode}`);
    } else {
      const order = await createPaymentMutation.mutateAsync({
        planName: "PRO",
      });
      if (order?.orderCode) {
        router.push(`/payment/checkout/${order.orderCode}`);
      }
    }
  };

  return (
    <div className="px-4 md:px-6 lg:px-8 py-5 pb-32 h-full flex flex-col w-full">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-10">
        <div
          className="mb-5 inline-flex items-center justify-center p-3 rounded-2xl"
          style={{ background: "var(--gray-a3)" }}
        >
          <Crown
            className="w-10 h-10"
            style={{ color: "var(--color-foreground)" }}
          />
        </div>
        <h1
          className="text-3xl md:text-4xl font-black mb-3"
          style={{ color: "var(--color-foreground)" }}
        >
          Nâng cấp không gian của bạn
        </h1>
        <p
          className="text-lg"
          style={{ color: "var(--muted-foreground)" }}
        >
          Chọn gói dung lượng phù hợp với nhu cầu lưu trữ để mở khóa đầy đủ sức
          mạnh của FileFlow.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">

        {/* ── Free Plan ── */}
        <div
          className="rounded-3xl p-8 flex flex-col"
          style={{
            background: "var(--gray-a2)",
          }}
        >
          <div className="mb-6">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "var(--color-foreground)" }}
            >
              Gói Cơ Bản
            </h2>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--muted-foreground)" }}
            >
              Bắt đầu miễn phí mãi mãi
            </p>
          </div>

          <div className="mb-8">
            <span
              className="text-5xl font-black"
              style={{ color: "var(--color-foreground)" }}
            >
              0đ
            </span>
            <span
              className="font-medium ml-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              /tháng
            </span>
          </div>

          <div className="flex-1 space-y-4 mb-8">
            {[
              { icon: HardDrive, label: "Dung lượng lưu trữ 5.0 GB" },
              { icon: Zap, label: "Tải lên tối đa 100MB / tệp" },
              { icon: Shield, label: "Sử dụng tính năng cơ bản" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--gray-11)" }}
                />
                <span
                  className="font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>

          <button
            className="w-full py-4 rounded-xl font-bold transition-all cursor-pointer"
            style={{
              background: isPro ? "var(--gray-a3)" : "var(--gray-a4)",
              color: isPro ? "var(--muted-foreground)" : "var(--color-foreground)",
              border: "1px solid var(--gray-a4)",
              cursor: isPro ? "default" : "pointer",
            }}
            disabled={!isPro}
            onClick={() => router.push("/dashboard")}
          >
            {!isPro ? "Gói hiện tại" : "Chuyển về gói này"}
          </button>
        </div>

        {/* ── Pro Plan ── */}
        <div
          className="rounded-3xl p-8 flex flex-col relative lg:scale-[1.02]"
          style={{
            background: "var(--color-foreground)",
            color: "var(--color-background)",
          }}
        >
          {/* Badge */}
          <div
            className="absolute top-0 right-8 -translate-y-1/2 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#ffffff",
            }}
          >
            PHỔ BIẾN NHẤT
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Crown
                className="w-5 h-5"
                style={{ color: "#f59e0b" }}
              />
              <h2
                className="text-2xl font-bold"
                style={{ color: "var(--color-background)" }}
              >
                FileFlow Pro
              </h2>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--gray-a6)" }}
            >
              Lưu trữ không giới hạn cho mọi nhu cầu
            </p>
          </div>

          <div className="mb-8">
            <span
              className="text-5xl font-black"
              style={{ color: "var(--color-background)" }}
            >
              99.000đ
            </span>
            <span
              className="font-medium ml-1"
              style={{ color: "var(--gray-a6)" }}
            >
              /tháng
            </span>
          </div>

          {/* Feature list — no nested border, uses divider lines */}
          <div className="flex-1 space-y-4 mb-8">
            {[
              { icon: HardDrive, label: "Lưu trữ 2.0 TB (2,000 GB)" },
              { icon: Infinity, label: "Không giới hạn kích thước tệp tải lên" },
              { icon: Zap, label: "Băng thông tải không giới hạn" },
              { icon: Shield, label: "Mã hóa bảo vệ tệp cao cấp (AES-256)" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3"
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "#f59e0b" }}
                />
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>

          <button
            className="w-full py-4 rounded-xl font-bold transition-all"
            style={{
              background: isPro
                ? "var(--gray-a4)"
                : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: isPro ? "var(--gray-a6)" : "#ffffff",
              cursor:
                isPro || createPaymentMutation.isPending
                  ? "default"
                  : "pointer",
              boxShadow: isPro
                ? "none"
                : "0 2px 8px rgba(245, 158, 11, 0.3)",
            }}
            disabled={isPro || createPaymentMutation.isPending}
            onClick={handleUpgradeClick}
          >
            {createPaymentMutation.isPending
              ? "Đang xử lý..."
              : pendingOrder
                ? "Tiếp tục thanh toán"
                : isPro
                  ? "Đang sử dụng"
                  : "Nâng cấp ngay"}
          </button>

          <p
            className="text-center text-xs mt-4 font-medium"
            style={{ color: "var(--gray-a6)" }}
          >
            Hủy bỏ bất cứ lúc nào. Không ràng buộc.
          </p>
        </div>
      </div>
    </div>
  );
}
