"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  Shield,
  HardDrive,
  Crown,
  CheckCircle2,
  Info,
  QrCode,
} from "lucide-react";
import { Flex, Box, Text, Button } from "@radix-ui/themes";
import { useCreatePaymentMutation } from "@/features/payment/mutations";
import { usePaymentStatusQuery } from "@/features/payment/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { getApiErrorMessage } from "@/types/api";
import { toast } from "sonner";

// ============================================================================
// Types
// ============================================================================

interface Plan {
  id: string;
  name: string;
  price: number;
  storage: string;
  storageBytes: number;
  recommended: boolean;
  features: string[];
}

// ============================================================================
// Constants
// ============================================================================

const PLANS: Plan[] = [
  {
    id: "FREE",
    name: "Gói Cơ Bản",
    price: 0,
    storage: "5 GB",
    storageBytes: 5 * 1024 * 1024 * 1024,
    recommended: false,
    features: [
      "Dung lượng lưu trữ 5 GB",
      "Upload tối đa 100 MB / tệp",
      "Sử dụng tính năng cơ bản",
      "Hỗ trợ qua email",
    ],
  },
  {
    id: "MONTHLY",
    name: "FileFlow Pro",
    price: 99000,
    storage: "2.0 TB",
    storageBytes: 2 * 1024 * 1024 * 1024 * 1024,
    recommended: true,
    features: [
      "Lưu trữ không giới hạn 2.0 TB",
      "Upload không giới hạn kích thước tệp",
      "Băng thông tải không giới hạn",
      "Mã hóa bảo vệ tệp cao cấp (AES-256)",
      "Hỗ trợ ưu tiên 24/7",
      "Khôi phục tệp đã xóa trong 30 ngày",
    ],
  },
  {
    id: "YEARLY",
    name: "FileFlow Enterprise",
    price: 990000,
    storage: "Unlimited",
    storageBytes: 999 * 1024 * 1024 * 1024 * 1024,
    recommended: false,
    features: [
      "Tất cả tính năng của gói Pro",
      "Lưu trữ không giới hạn thực sự",
      "Quản lý team & phân quyền",
      "API truy cập riêng",
      "SLA cam kết 99.9% uptime",
      "Hỗ trợ chuyên biệt doanh nghiệp",
    ],
  },
];

function formatVND(amount: number) {
  if (amount === 0) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

// ============================================================================
// Sub-components
// ============================================================================

function PlanIcon({ planId }: { planId: string }) {
  if (planId === "FREE") return <HardDrive className="w-5 h-5 text-muted-foreground" />;
  if (planId === "YEARLY") return <Crown className="w-5 h-5 text-orange-500 fill-orange-500" />;
  return <Zap className="w-5 h-5 text-primary" />;
}

function PlanBadge({
  plan,
  isCurrentPlan,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
}) {
  if (isCurrentPlan) {
    return (
      <div className="absolute top-0 right-6 -translate-y-1/2 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5" /> Đang sử dụng
      </div>
    );
  }
  if (plan.recommended) {
    return (
      <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
        PHỔ BIẾN NHẤT
      </div>
    );
  }
  return null;
}

function PendingOrderAlert({
  pendingOrder,
  onContinue,
  onCancel,
  isCanceling,
}: {
  pendingOrder: { orderCode: string; planName: string } | null;
  onContinue: () => void;
  onCancel: () => void;
  isCanceling: boolean;
}) {
  if (!pendingOrder) return null;

  return (
    <Box
      p="4"
      mb="8"
      className="rounded-2xl border border-amber-500/30 bg-amber-500/10"
    >
      <Flex align="start" justify="between" className="flex-wrap gap-4">
        <Flex align="start" gap="3">
          <div className="bg-amber-500/20 p-2 rounded-full hidden sm:block">
            <Info className="w-5 h-5 text-amber-700 dark:text-amber-400" />
          </div>
          <div className="mt-0.5">
            <strong className="text-amber-900 dark:text-amber-100 block text-base mb-1">
              Đơn hàng #{pendingOrder.orderCode} đang chờ thanh toán
            </strong>
            <span className="text-amber-800 dark:text-amber-200 font-medium max-w-xl block text-sm">
              Bạn có 1 đơn đăng ký gói {pendingOrder.planName} chưa hoàn
              tất. Bạn có muốn tiếp tục thanh toán hay hủy để tạo đơn mới?
            </span>
          </div>
        </Flex>
        <Flex gap="3" align="center">
          <Button
            variant="soft"
            color="red"
            size="3"
            onClick={onCancel}
            loading={isCanceling}
            disabled={isCanceling}
          >
            Hủy đơn
          </Button>
          <Button
            variant="solid"
            color="amber"
            size="3"
            className="font-bold shadow-md"
            onClick={onContinue}
          >
            Tiếp tục thanh toán
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

function InfoBanner() {
  return (
    <Box
      p="4"
      mb="8"
      className="rounded-2xl border border-blue-500/20 bg-blue-500/10"
    >
      <Flex align="start" gap="3">
        <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
        <div className="text-sm space-y-1">
          <Text weight="bold" className="text-blue-500 block">
            Thanh toán qua mã QR Ngân hàng
          </Text>
          <Text className="text-muted-foreground font-medium">
            Hệ thống hỗ trợ tất cả ngân hàng Việt Nam: MB Bank, TPBank,
            Vietcombank, ACB, VietinBank... Thanh toán được xác nhận tự động
            trong <strong>1–3 phút</strong> sau khi chuyển khoản thành công.
          </Text>
        </div>
      </Flex>
    </Box>
  );
}

function PlanCard({
  plan,
  isCurrentPlan,
  isSelected,
  onSelect,
  onProceed,
  isProcessing,
  hasPendingOrder,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onProceed: () => void;
  isProcessing: boolean;
  hasPendingOrder: boolean;
}) {
  const isDisabled = plan.id === "FREE" || isCurrentPlan;

  return (
    <Box
      onClick={() => !isDisabled && onSelect()}
      className={`
        relative rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-200
        ${isSelected ? "border-2 shadow-xl ring-2 ring-primary/30" : "border border-border/50 shadow-sm hover:shadow-md"}
        ${isDisabled ? "opacity-70 cursor-not-allowed" : ""}
        ${plan.recommended ? "bg-background" : "bg-card"}
      `}
      style={
        isSelected
          ? { borderColor: "var(--primary)", background: "var(--background)" }
          : {}
      }
    >
      <PlanBadge plan={plan} isCurrentPlan={isCurrentPlan} />

      <Flex justify="between" align="start" className="flex-wrap gap-4">
        {/* Left: Plan Info */}
        <div className="flex-1 min-w-[200px]">
          <Flex align="center" gap="2" mb="3">
            <div
              className={`p-2 rounded-xl border ${plan.recommended ? "bg-primary/20 border-primary/30" : "bg-secondary border-border"}`}
            >
              <PlanIcon planId={plan.id} />
            </div>
            <div>
              <Text weight="bold" size="4">
                {plan.name}
              </Text>
              <Flex align="center" gap="2" mt="1">
                <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                <Text size="2" className="text-muted-foreground font-medium">
                  {plan.storage} lưu trữ
                </Text>
              </Flex>
            </div>
          </Flex>

          <div className="space-y-2.5">
            {plan.features.map((feature, i) => (
              <Flex key={i} align="center" gap="2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <Text size="2" className="font-medium">
                  {feature}
                </Text>
              </Flex>
            ))}
          </div>
        </div>

        {/* Right: Price + CTA */}
        <div className="flex flex-col items-end gap-4 min-w-[160px]">
          <div className="text-right">
            <div className="text-4xl font-black text-foreground">
              {formatVND(plan.price)}
            </div>
            {plan.price > 0 && (
              <Text size="2" className="text-muted-foreground font-medium">
                {plan.id === "YEARLY" ? "/năm" : "/tháng"}
              </Text>
            )}
          </div>

          {isSelected && !isCurrentPlan && (
            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
              <CheckCircle2 className="w-4 h-4" /> Đã chọn
            </div>
          )}

          {/* CTA Button */}
          {isCurrentPlan ? (
            <Button variant="soft" color="gray" size="3" disabled>
              <CheckCircle2 className="w-4 h-4" /> Đang sử dụng
            </Button>
          ) : plan.id === "FREE" ? (
            <Button variant="soft" color="gray" size="3" disabled>
              Miễn phí
            </Button>
          ) : (
            <Button
              variant="solid"
              size="3"
              className="font-bold shadow-md"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
                onProceed();
              }}
              loading={isProcessing}
              disabled={!!hasPendingOrder || isProcessing}
            >
              {hasPendingOrder ? (
                "Có đơn đang chờ"
              ) : (
                <>
                  <QrCode className="w-4 h-4" /> Nạp tiền
                </>
              )}
            </Button>
          )}
        </div>
      </Flex>
    </Box>
  );
}

function TrustBadges() {
  return (
    <Flex
      align="center"
      justify="center"
      gap="6"
      mt="10"
      className="flex-wrap text-muted-foreground"
    >
      <Flex align="center" gap="2" className="text-sm font-medium">
        <Shield className="w-4 h-4 text-emerald-500" /> Thanh toán bảo mật
      </Flex>
      <Flex align="center" gap="2" className="text-sm font-medium">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Xác nhận tự động
      </Flex>
      <Flex align="center" gap="2" className="text-sm font-medium">
        <Zap className="w-4 h-4 text-emerald-500" /> Kích hoạt trong 1–3 phút
      </Flex>
    </Flex>
  );
}

// ============================================================================
// Page Component
// ============================================================================

export default function UpgradePage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: paymentStatus } = usePaymentStatusQuery();
  const createPaymentMutation = useCreatePaymentMutation();

  const [selectedPlan, setSelectedPlan] = useState<string>("MONTHLY");

  const currentPlan = user?.subscriptionPlan ?? "FREE";
  const pendingOrder =
    paymentStatus?.status === "PENDING" ? paymentStatus : null;

  const handleSelectPlan = (planId: string) => {
    if (planId === "FREE") return;
    setSelectedPlan(planId);
  };

  const handleProceedToPayment = async () => {
    if (pendingOrder) {
      router.push(`/payment/checkout/${pendingOrder.orderCode}`);
      return;
    }

    try {
      const result = await createPaymentMutation.mutateAsync({
        planName: selectedPlan === "MONTHLY" ? "PRO" : "ENTERPRISE",
      });
      if (result?.orderCode) {
        router.push(`/payment/checkout/${result.orderCode}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lỗi khi tạo đơn thanh toán"));
    }
  };

  const handleCancelPending = () => {
    // TODO: wire up cancel mutation when available
    toast.info("Tính năng hủy đơn đang được phát triển");
  };

  return (
    <div className="p-4 md:p-8 pb-32 w-full h-full overflow-y-auto">
      {/* Page Header */}
      <Flex align="center" mb="8">
        <Flex align="center" gap="3">
          <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
            <QrCode className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">
              Nạp tiền & Thanh toán
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-0.5">
              Quét mã QR để nâng cấp gói dịch vụ
            </p>
          </div>
        </Flex>
      </Flex>

      <InfoBanner />

      <PendingOrderAlert
        pendingOrder={pendingOrder}
        onContinue={() =>
          router.push(`/payment/checkout/${pendingOrder!.orderCode}`)
        }
        onCancel={handleCancelPending}
        isCanceling={false}
      />

      {/* Plan Cards */}
      <Flex direction="column" gap="6" className="max-w-4xl mx-auto">
        {PLANS.map((plan) => {
          const isCurrentPlan =
            (plan.id === "FREE" && currentPlan === "FREE") ||
            plan.id === currentPlan ||
            (plan.id === "MONTHLY" && currentPlan === "PRO");
          const isSelected = selectedPlan === plan.id;

          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={isCurrentPlan}
              isSelected={isSelected}
              onSelect={() => handleSelectPlan(plan.id)}
              onProceed={handleProceedToPayment}
              isProcessing={createPaymentMutation.isPending}
              hasPendingOrder={!!pendingOrder}
            />
          );
        })}
      </Flex>

      <TrustBadges />
    </div>
  );
}
