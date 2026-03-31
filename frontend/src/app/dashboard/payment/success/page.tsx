"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Flex, Text, Box, Button } from "@radix-ui/themes";
import Link from "next/link";
import {
  CheckCircle2, Home, HardDrive,
  Download, Clock, Star
} from "lucide-react";
import { usePaymentHistory } from "@/features/payment/queries";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderCode = searchParams.get("orderCode") ?? "";

  const { data: history } = usePaymentHistory();
  const payment = history?.find((p) => p.orderCode === orderCode);

  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiLayers, setConfettiLayers] = useState<Array<{ bg: string; left: string; delay: string; duration: string }>>([]);

  useEffect(() => {
    const showTimer = setTimeout(() => {
      setConfettiLayers(Array.from({ length: 40 }).map((_, i) => ({
        bg: ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6"][i % 5],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 2}s`,
      })));
      setShowConfetti(true);
    }, 50);

    const hideTimer = setTimeout(() => setShowConfetti(false), 3050);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  const planName = payment?.planName ?? "FileFlow Pro";
  const amount = payment?.amount ?? 99000;
  const formattedAmount = new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--background)" }}>
      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
          {confettiLayers.map((layer, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                background: layer.bg,
                left: layer.left,
                top: "-10px",
                animationDelay: layer.delay,
                animationDuration: layer.duration,
              }}
            />
          ))}
        </div>
      )}

      <Box
        className="w-full max-w-lg rounded-3xl border border-emerald-500/30 shadow-2xl overflow-hidden"
        style={{ background: "var(--color-background)" }}
      >
        {/* Success Header */}
        <Box
          p="8"
          className="text-center"
          style={{
            background: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.05) 100%)",
            borderBottom: "1px solid rgba(16,185,129,0.2)",
          }}
        >
          {/* Animated Check */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center animate-success-bounce">
              <CheckCircle2 className="w-14 h-14 text-emerald-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center animate-ping opacity-50">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-black mb-3 text-foreground">
            Thanh toán thành công!
          </h1>
          <p className="text-muted-foreground text-base font-medium mb-6">
            Cảm ơn bạn đã tin tưởng FileFlow. Gói dịch vụ của bạn đã được kích hoạt.
          </p>

          {/* Plan Summary */}
          <Box
            p="4"
            className="rounded-2xl"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <Flex align="center" justify="center" gap="2" mb="2">
              <HardDrive className="w-4 h-4 text-emerald-500" />
              <Text weight="bold" size="3" className="text-emerald-500">{planName}</Text>
            </Flex>
            <Text size="5" weight="bold" className="text-foreground font-black">
              {formattedAmount}
            </Text>
            {orderCode && (
              <Text size="1" className="text-muted-foreground font-mono mt-1 block">
                Mã GD: {orderCode.slice(0, 18)}...
              </Text>
            )}
          </Box>
        </Box>

        {/* What's included */}
        <Box p="6">
          <Text weight="bold" size="2" mb="4" className="text-muted-foreground uppercase tracking-wider">
            Tính năng đã kích hoạt
          </Text>
          <div className="space-y-3">
            {[
              { icon: HardDrive, text: "Nâng cấp dung lượng lưu trữ 2TB" },
              { icon: Star, text: "Upload không giới hạn kích thước tệp" },
              { icon: CheckCircle2, text: "Băng thông tải không giới hạn" },
              { icon: Clock, text: "Hỗ trợ ưu tiên 24/7" },
            ].map((item, i) => (
              <Flex key={i} align="center" gap="3" className="text-sm font-medium">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-foreground">{item.text}</span>
              </Flex>
            ))}
          </div>
        </Box>

        {/* Actions */}
        <Box p="6" pt="0" className="flex flex-col sm:flex-row gap-3">
          <Button size="3" className="flex-1 font-bold" asChild>
            <Link href="/dashboard">
              <Home className="w-4 h-4" /> Về trang chủ
            </Link>
          </Button>
          <Button size="3" variant="soft" color="gray" className="flex-1 font-bold" asChild>
            <Link href="/dashboard/payment/history">
              <Download className="w-4 h-4" /> Xem hóa đơn
            </Link>
          </Button>
        </Box>

        {/* Support note */}
        <Box
          p="4"
          mx="6"
          mb="6"
          className="rounded-xl text-center"
          style={{ background: "var(--color-muted)", border: "1px solid var(--color-border)" }}
        >
          <Text size="2" className="text-muted-foreground font-medium">
            Nếu có thắc mắc, liên hệ <strong className="text-foreground">hotro@fileflow.vn</strong> hoặc zalo: <strong className="text-foreground">FileFlow Support</strong>
          </Text>
        </Box>
      </Box>

      <style jsx global>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti-fall linear forwards;
        }
        @keyframes success-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        .animate-success-bounce {
          animation: success-bounce 0.6s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Text className="text-muted-foreground">Đang tải...</Text>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
