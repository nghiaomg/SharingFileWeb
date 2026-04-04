"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Box, Flex, Heading, Text, Button, Badge } from "@radix-ui/themes";
import { useCurrentUser } from "@/features/auth/queries";
import { getCurrentPlan } from "@/features/plans/plans.config";

export function SubscriptionSection() {
  const { data: user } = useCurrentUser();
  const currentPlan = getCurrentPlan(user?.subscriptionPlan);

  const isFree = currentPlan.id === "FREE";

  return (
    <Box>
      <Flex align="center" gap="3" mb="4">
        <Box
          p="2"
          style={{
            background: "var(--amber-a3)",
            color: "var(--amber-11)",
            borderRadius: "var(--radius-3)",
          }}
        >
          <CreditCard className="w-5 h-5" />
        </Box>
        <Box>
          <Heading size="5" style={{ color: "var(--card-heading)" }}>
            Gói lưu trữ
          </Heading>
          <Text as="div" size="2" style={{ color: "var(--muted-foreground)" }}>
            Quản lý gói dịch vụ của bạn
          </Text>
        </Box>
      </Flex>

      <Box
        p="5"
        style={{
          background: "var(--gray-a2)",
          borderRadius: "var(--radius-4)",
        }}
      >
        <Flex align="center" gap="2" mb="2">
          <Heading size="5" weight="bold" style={{ color: "var(--card-heading)" }}>
            {currentPlan.name}
          </Heading>
          {currentPlan.badge && (
            <Badge size="1" color="gray" variant="solid" radius="full">
              {currentPlan.badge}
            </Badge>
          )}
        </Flex>

        <Flex align="baseline" gap="1" mb="4">
          <Heading size="8" weight="bold" style={{ color: "var(--card-heading)" }}>
            {currentPlan.price === 0 ? "Miễn phí" : currentPlan.priceDisplay}
          </Heading>
          {currentPlan.price > 0 && (
            <Text size="3" weight="medium" style={{ color: "var(--muted-foreground)" }}>
              /tháng
            </Text>
          )}
        </Flex>

        {/* Storage info */}
        <Text size="2" mb="5" style={{ color: "var(--muted-foreground)" }}>
          Dung lượng: <strong style={{ color: "var(--color-foreground)" }}>{currentPlan.storage}</strong>
        </Text>

        <Flex direction="column" gap="2">
          {!isFree ? (
            <>
              <Button asChild size="3" variant="soft" color="gray">
                <Link href="/dashboard/upgrade">Quản lý gói</Link>
              </Button>
              <Button asChild size="3" variant="ghost" color="gray">
                <Link href="/dashboard/billing">Xem lịch sử thanh toán</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="3" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}>
              <Link href="/dashboard/upgrade">Nâng cấp ngay</Link>
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
