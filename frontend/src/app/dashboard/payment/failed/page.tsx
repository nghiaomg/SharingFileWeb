"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Flex, Text, Box, Button } from "@radix-ui/themes";
import Link from "next/link";
import {
  XCircle,
  Home,
  RefreshCw,
  Clock,
  AlertTriangle,
  Mail,
  MessageCircle,
} from "lucide-react";

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") ?? "";
  const reason = searchParams.get("reason") ?? "";

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--background)" }}
    >
      <Box
        className="w-full max-w-lg rounded-3xl border border-red-500/30 shadow-2xl overflow-hidden"
        style={{ background: "var(--color-background)" }}
      >
        {/* Failed Header */}
        <Box
          p="8"
          className="text-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.04) 100%)",
            borderBottom: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {/* Animated X */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 rounded-full bg-red-500/15 flex items-center justify-center animate-fail-shake">
              <XCircle className="w-14 h-14 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-black mb-3 text-foreground">
            Thanh toán không thành công
          </h1>
          <p className="text-muted-foreground text-base font-medium">
            {reason === "EXPIRED"
              ? "Mã QR thanh toán đã hết hạn. Vui lòng tạo yêu cầu thanh toán mới."
              : reason === "CANCELLED"
                ? "Bạn đã hủy thanh toán. Bạn có thể thử lại bất cứ lúc nào."
                : "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ."}
          </p>

          {orderId && (
            <Box
              mt="4"
              p="3"
              className="inline-flex items-center gap-2 rounded-xl"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Text size="2" className="text-muted-foreground font-mono">
                Mã giao dịch: {orderId.slice(0, 18)}...
              </Text>
            </Box>
          )}
        </Box>

        {/* Common reasons */}
        <Box p="6">
          <Text
            weight="bold"
            size="2"
            mb="4"
            className="text-muted-foreground uppercase tracking-wider"
          >
            Nguyên nhân thường gặp
          </Text>
          <div className="space-y-3">
            {[
              { icon: Clock, text: "Mã QR đã hết hiệu lực (sau 15 phút)" },
              { icon: AlertTriangle, text: "Số tiền chuyển khoản không đúng" },
              { icon: XCircle, text: "Nội dung chuyển khoản không chính xác" },
              { icon: RefreshCw, text: "Sự cố kết nối với ngân hàng" },
            ].map((item, i) => (
              <Flex
                key={i}
                align="center"
                gap="3"
                className="text-sm font-medium"
              >
                <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-foreground">{item.text}</span>
              </Flex>
            ))}
          </div>
        </Box>

        {/* Actions */}
        <Box p="6" pt="0" className="flex flex-col sm:flex-row gap-3">
          <Button size="3" className="flex-1 font-bold" asChild>
            <Link href="/dashboard/payment">
              <RefreshCw className="w-4 h-4" /> Thử lại
            </Link>
          </Button>
          <Button
            size="3"
            variant="soft"
            color="gray"
            className="flex-1 font-bold"
            asChild
          >
            <Link href="/dashboard">
              <Home className="w-4 h-4" /> Về trang chủ
            </Link>
          </Button>
        </Box>

        {/* Support */}
        <Box
          p="4"
          mx="6"
          mb="6"
          className="rounded-xl"
          style={{
            background: "var(--color-muted)",
            border: "1px solid var(--color-border)",
          }}
        >
          <Text size="2" weight="bold" mb="3" className="text-foreground block">
            Cần hỗ trợ?
          </Text>
          <Flex gap="3" wrap="wrap">
            <Flex
              asChild
              align="center"
              gap="2"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-secondary"
            >
              <a href="mailto:hotro@fileflow.vn">
                <Mail className="w-4 h-4" /> Email hỗ trợ
              </a>
            </Flex>
            <Flex
              asChild
              align="center"
              gap="2"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer px-3 py-2 rounded-xl hover:bg-secondary"
            >
              <a
                href="https://zalo.me/fileflow"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4" /> Zalo Support
              </a>
            </Flex>
          </Flex>
        </Box>
      </Box>

      <style jsx global>{`
        @keyframes fail-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }
        .animate-fail-shake {
          animation: fail-shake 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Text className="text-muted-foreground">Đang tải...</Text>
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
