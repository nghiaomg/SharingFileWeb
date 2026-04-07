"use client";

import { useRouter } from "next/navigation";
import { Zap, HardDrive, CheckCircle2, QrCode } from "lucide-react";
import { Flex, Box, Text, Button } from "@radix-ui/themes";
import { useCreatePaymentMutation, useCancelPaymentMutation } from "@/features/payment/mutations";
import { usePaymentStatusQuery } from "@/features/payment/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { getApiErrorMessage } from "@/types/api";
import { toast } from "sonner";
import {
  PLANS,
  Plan,
  getPlanIdFromSubscription,
} from "@/features/plans/plans.config";

// ============================================================================
// Sub-components
// ============================================================================

function PlanIcon({ planId }: { planId: string }) {
  if (planId === "FREE") return <HardDrive className="w-5 h-5" />;
  return <Zap className="w-5 h-5" />;
}

function PlanCard({
  plan,
  isCurrentPlan,
  onProceed,
  isProcessing,
}: {
  plan: Plan;
  isCurrentPlan: boolean;
  onProceed: () => void;
  isProcessing: boolean;
}) {
  return (
    <Box
      className="flex flex-col rounded-2xl p-5"
      style={
        plan.recommended
          ? {
            background: "var(--color-foreground)",
            color: "var(--color-background)",
          }
          : { background: "var(--gray-a2)" }
      }
    >
      {/* Header */}
      <Flex align="center" justify="between" mb="3">
        <Flex align="center" gap="2">
          <Box
            p="2"
            style={{
              background: plan.recommended
                ? "rgba(255,255,255,0.2)"
                : "var(--gray-a3)",
              borderRadius: "var(--radius-3)",
            }}
          >
            <PlanIcon planId={plan.id} />
          </Box>
          <Text
            weight="bold"
            size="4"
            style={plan.recommended ? { color: "var(--color-background)" } : {}}
          >
            {plan.name}
          </Text>
        </Flex>
        {plan.recommended && (
          <Text
            size="1"
            weight="bold"
            className="px-2 py-0.5 rounded-full"
            style={{ background: "rgba(245,158,11,0.9)", color: "#fff" }}
          >
            PHỔ BIẾN NHẤT
          </Text>
        )}
        {isCurrentPlan && (
          <Flex align="center" gap="1" style={{ color: "var(--emerald-11)" }}>
            <CheckCircle2 className="w-4 h-4" />
            <Text size="1" weight="bold" style={{ color: "var(--emerald-11)" }}>
              ĐANG DÙNG
            </Text>
          </Flex>
        )}
      </Flex>

      {/* Storage + Price */}
      <Flex align="baseline" justify="between" mb="4">
        <Text
          size="2"
          style={
            plan.recommended
              ? { color: "rgba(255,255,255,0.7)" }
              : { color: "var(--muted-foreground)" }
          }
        >
          {plan.storage}
        </Text>
        <Flex align="baseline" gap="1">
          <Text
            weight="bold"
            size="7"
            style={plan.recommended ? { color: "var(--color-background)" } : {}}
          >
            {plan.priceDisplay}
          </Text>
          {plan.price > 0 && (
            <Text
              size="2"
              style={plan.recommended ? { color: "rgba(255,255,255,0.7)" } : {}}
            >
              /tháng
            </Text>
          )}
        </Flex>
      </Flex>

      {/* Features */}
      <Box mb="4" style={{ flex: 1 }}>
        <Flex direction="column" gap="1">
          {plan.features.map((feature, i) => (
            <Flex key={i} align="center" gap="2">
              <CheckCircle2
                className="w-3.5 h-3.5 shrink-0"
                style={{
                  color: plan.recommended ? "#86efac" : "var(--emerald-11)",
                }}
              />
              <Text
                size="2"
                style={
                  plan.recommended ? { color: "rgba(255,255,255,0.9)" } : {}
                }
              >
                {feature}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Box>

      {/* CTA */}
      {isCurrentPlan ? (
        <Button
          variant="soft"
          color="gray"
          size="3"
          disabled
          className="w-full"
        >
          <CheckCircle2 className="w-4 h-4" /> Đang sử dụng
        </Button>
      ) : plan.id === "FREE" ? (
        <Button
          variant="outline"
          color="gray"
          size="3"
          disabled
          className="w-full"
        >
          Miễn phí
        </Button>
      ) : (
        <Button
          variant="solid"
          color="orange"
          size="3"
          className="w-full font-bold"
          onClick={onProceed}
          loading={isProcessing}
        >
          <QrCode className="w-4 h-4" /> Nạp tiền
        </Button>
      )}
    </Box>
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
  const cancelPaymentMutation = useCancelPaymentMutation();

  const currentPlanId = getPlanIdFromSubscription(user?.subscriptionPlan);
  const pendingOrder =
    paymentStatus?.status === "PENDING" ? paymentStatus : null;

  const handleProceedToPayment = async () => {
    if (pendingOrder) {
      router.push(`/payment/checkout/${pendingOrder.orderCode}`);
      return;
    }
    try {
      const result = await createPaymentMutation.mutateAsync({
        planName: "PRO",
      });
      if (result?.orderCode) {
        router.push(`/payment/checkout/${result.orderCode}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Lỗi khi tạo đơn thanh toán"));
    }
  };

  const handleCancelPending = () => {
    cancelPaymentMutation.mutate();
  };

  return (
    <Box
      p={{ initial: "4", sm: "6" }}
      style={{ height: "100%", overflowY: "auto" }}
    >
      {/* Header */}
      <Flex align="center" gap="2" mb="5">
        <QrCode className="w-6 h-6" style={{ color: "var(--icon-storage)" }} />
        <Text size="5" weight="bold" style={{ color: "var(--card-heading)" }}>
          Nâng cấp gói dịch vụ
        </Text>
      </Flex>

      {/* Pending Order Alert */}
      {pendingOrder && (
        <Box
          mb="4"
          p="3"
          className="rounded-xl border border-amber-500/30 bg-amber-500/10"
        >
          <Flex align="center" justify="between" gap="3">
            <Text size="2" style={{ color: "var(--amber-11)" }}>
              Đơn hàng <strong>#{pendingOrder.orderCode}</strong> đang chờ thanh
              toán
            </Text>
            <Flex gap="2">
              <Button
                variant="soft"
                color="red"
                size="1"
                onClick={handleCancelPending}
                loading={cancelPaymentMutation.isPending}
                disabled={cancelPaymentMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                variant="solid"
                color="amber"
                size="1"
                onClick={() =>
                  router.push(`/payment/checkout/${pendingOrder.orderCode}`)
                }
              >
                Thanh toán
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Plan Cards */}
      <Flex
        gap="4"
        justify="center"
        direction={{ initial: "column", sm: "row" }}
        style={{ maxWidth: 720, margin: "0 auto" }}
      >
        {PLANS.map((plan) => (
          <Box key={plan.id} style={{ flex: 1 }}>
            <PlanCard
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onProceed={handleProceedToPayment}
              isProcessing={createPaymentMutation.isPending}
            />
          </Box>
        ))}
      </Flex>

      {/* Footer note */}
      <Flex align="center" justify="center" mt="5" gap="6">
        <Flex align="center" gap="1">
          <CheckCircle2
            className="w-4 h-4"
            style={{ color: "var(--emerald-11)" }}
          />
          <Text size="2" style={{ color: "var(--muted-foreground)" }}>
            Thanh toán bảo mật
          </Text>
        </Flex>
        <Flex align="center" gap="1">
          <CheckCircle2
            className="w-4 h-4"
            style={{ color: "var(--emerald-11)" }}
          />
          <Text size="2" style={{ color: "var(--muted-foreground)" }}>
            Xác nhận tự động
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}
