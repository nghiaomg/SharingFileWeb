"use client";

import { Flex, Text, Box } from "@radix-ui/themes";
import {
  Banknote,
  Download,
  ExternalLink,
  CalendarDays,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { usePaymentHistory } from "@/features/payment/queries";
import { formatDateVN } from "@/lib/format";

const STATUS_CONFIG = {
  PENDING: {
    label: "Đang xử lý",
    icon: Clock,
    color: "var(--accent-warning)",
    bg: "rgba(245,158,11,0.1)",
  },
  CONFIRMED: {
    label: "Thành công",
    icon: CheckCircle2,
    color: "var(--accent-success)",
    bg: "rgba(16,185,129,0.1)",
  },
  FAILED: {
    label: "Thất bại",
    icon: XCircle,
    color: "var(--accent-red)",
    bg: "rgba(239,68,68,0.1)",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    icon: Clock,
    color: "var(--gray-9)",
    bg: "rgba(161,161,170,0.1)",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: XCircle,
    color: "var(--gray-9)",
    bg: "rgba(161,161,170,0.1)",
  },
};

const MOCK_HISTORY = [
  {
    id: "m1",
    orderCode: "ORD-04-PRO",
    status: "CONFIRMED" as const,
    amount: 99000,
    planName: "FileFlow Pro",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    expiredAt: new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000 + 15 * 60000,
    ).toISOString(),
    qrUrl: "",
  },
  {
    id: "m2",
    orderCode: "ORD-03-PRO",
    status: "CONFIRMED" as const,
    amount: 99000,
    planName: "FileFlow Pro",
    createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
    expiredAt: new Date(
      Date.now() - 37 * 24 * 60 * 60 * 1000 + 15 * 60000,
    ).toISOString(),
    qrUrl: "",
  },
  {
    id: "m3",
    orderCode: "ORD-03-ENT",
    status: "EXPIRED" as const,
    amount: 990000,
    planName: "FileFlow Enterprise",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    expiredAt: new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000 + 15 * 60000,
    ).toISOString(),
    qrUrl: "",
  },
  {
    id: "m4",
    orderCode: "ORD-02-PRO",
    status: "CONFIRMED" as const,
    amount: 99000,
    planName: "FileFlow Pro",
    createdAt: new Date(Date.now() - 67 * 24 * 60 * 60 * 1000).toISOString(),
    expiredAt: new Date(
      Date.now() - 67 * 24 * 60 * 60 * 1000 + 15 * 60000,
    ).toISOString(),
    qrUrl: "",
  },
];

export default function PaymentHistoryPage() {
  const { data: history, isLoading, isError } = usePaymentHistory();

  const payments = history && history.length > 0 ? history : MOCK_HISTORY;

  return (
    <div className="p-4 md:p-8 pb-32 w-full h-full overflow-y-auto">
      {/* Header */}
      <Flex align="center" justify="between" mb="8" className="flex-wrap gap-4">
        <Flex align="center" gap="3">
          <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30">
            <Banknote className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">
              Lịch sử thanh toán
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-0.5">
              Xem chi tiết các giao dịch thanh toán của bạn
            </p>
          </div>
        </Flex>

        <button className="flex items-center gap-2 text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-xl transition-colors cursor-pointer border border-border">
          <Download className="w-4 h-4" /> Tải tất cả PDF
        </button>
      </Flex>

      {/* Loading / Error state */}
      {isLoading && (
        <Flex justify="center" py="8">
          <Text className="text-muted-foreground">Đang tải lịch sử...</Text>
        </Flex>
      )}

      {isError && (
        <Box
          p="6"
          className="rounded-2xl border border-red-500/20 bg-red-500/10 text-center"
        >
          <Text weight="bold" className="text-red-500">
            Không thể tải lịch sử thanh toán.
          </Text>
          <Text size="2" className="text-muted-foreground mt-1 block">
            Vui lòng thử lại sau.
          </Text>
        </Box>
      )}

      {/* Payment Table */}
      {!isLoading && !isError && (
        <Box className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="font-semibold pb-4 pl-4 text-muted-foreground text-sm">
                    Mã giao dịch
                  </th>
                  <th className="font-semibold pb-4 text-muted-foreground text-sm">
                    Ngày tạo
                  </th>
                  <th className="font-semibold pb-4 text-muted-foreground text-sm">
                    Gói dịch vụ
                  </th>
                  <th className="font-semibold pb-4 text-muted-foreground text-sm">
                    Số tiền
                  </th>
                  <th className="font-semibold pb-4 text-muted-foreground text-sm">
                    Trạng thái
                  </th>
                  <th className="font-semibold pb-4 pr-4 text-right text-muted-foreground text-sm">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {payments.map((payment) => {
                  const config = STATUS_CONFIG[payment.status];
                  const Icon = config.icon;
                  const formattedAmount =
                    new Intl.NumberFormat("vi-VN").format(payment.amount) + "đ";

                  return (
                    <tr
                      key={payment.id}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-5 pl-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div>
                            <div className="font-bold text-sm font-mono">
                              {payment.orderCode}
                            </div>
                            {payment.status === "CONFIRMED" && (
                              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                Đã thanh toán
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                          <CalendarDays className="w-4 h-4 shrink-0" />
                          {formatDateVN(payment.createdAt)}
                        </div>
                      </td>
                      <td className="py-5">
                        <Flex align="center" gap="2">
                          {payment.planName.includes("Enterprise") ? (
                            <ArrowUpRight className="w-4 h-4 text-orange-500 shrink-0" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          )}
                          <Text size="2" weight="bold">
                            {payment.planName}
                          </Text>
                        </Flex>
                      </td>
                      <td className="py-5 font-bold font-mono text-sm">
                        {formattedAmount}
                      </td>
                      <td className="py-5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border"
                          style={{
                            color: config.color,
                            background: config.bg,
                            borderColor: `${config.color}30`,
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="py-5 pr-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-muted-foreground hover:text-primary bg-background border border-border shadow-sm rounded-lg transition-colors cursor-pointer"
                            title="Chi tiết"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-muted-foreground hover:text-emerald-500 bg-background border border-border shadow-sm rounded-lg transition-colors cursor-pointer"
                            title="Tải PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {payments.length === 0 && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              py="8"
              gap="3"
            >
              <Banknote className="w-12 h-12 text-muted-foreground/50" />
              <Text weight="bold" className="text-muted-foreground">
                Chưa có giao dịch nào
              </Text>
              <Text size="2" className="text-muted-foreground/70">
                Thanh toán qua QR Code để nâng cấp gói dịch vụ.
              </Text>
            </Flex>
          )}

          {/* Footer note */}
          <Box
            mt="6"
            pt="4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <Text size="2" className="text-muted-foreground">
              Đang hiển thị{" "}
              <span className="font-bold text-foreground">
                {payments.length}
              </span>{" "}
              giao dịch gần nhất.
            </Text>
          </Box>
        </Box>
      )}
    </div>
  );
}
