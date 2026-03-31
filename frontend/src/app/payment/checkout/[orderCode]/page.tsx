"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QrCode, Copy, ChevronLeft, CalendarClock, ShieldCheck } from "lucide-react";
import { Button, Flex, Text, Box, Badge } from "@radix-ui/themes";
import { toast } from "sonner";
import { usePaymentStatusQuery } from "@/features/payment/queries";
import { useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/features/auth/queries";

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const orderCode = params.orderCode as string;

    const { data: paymentStatus } = usePaymentStatusQuery();
    const [timeLeft, setTimeLeft] = useState<string>("");

    // Ensure what we are checking is actually the order from the URL
    const isValidOrder = paymentStatus && paymentStatus.orderCode === orderCode;
    const isExpired = paymentStatus?.status === "EXPIRED";
    const isConfirmed = paymentStatus?.status === "CONFIRMED";

    useEffect(() => {
        if (!isValidOrder || !paymentStatus.expiredAt) return;

        if (paymentStatus.status === "CONFIRMED") {
            toast.success("Thanh toán thành công!");
            queryClient.invalidateQueries({ queryKey: authKeys.all() });
            router.push(`/dashboard/payment/success?orderCode=${orderCode}`);
            return;
        }

        const timer = setInterval(() => {
            const expireDate = new Date(paymentStatus.expiredAt).getTime();
            const now = new Date().getTime();
            const diff = expireDate - now;

            if (diff <= 0) {
                clearInterval(timer);
                setTimeLeft("Đã hết hạn");
                return;
            }

            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [isValidOrder, paymentStatus, orderCode, router, queryClient]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã copy vào bộ nhớ tạm");
    };

    if (!paymentStatus) {
        return (
            <div className="min-h-screen bg-background w-full flex items-center justify-center">
                <Text color="gray">Đang tải thông tin đơn hàng...</Text>
            </div>
        );
    }

    if (!isValidOrder) {
        return (
            <div className="min-h-screen bg-background w-full flex flex-col items-center justify-center gap-4">
                <Text>Không tìm thấy đơn hàng hoặc đơn hàng đã cũ.</Text>
                <Button variant="soft" onClick={() => router.push("/dashboard/payment")}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12 md:p-8">
            <div className="max-w-4xl w-full">

                <Button variant="ghost" color="gray" className="mb-8 hover:bg-muted cursor-pointer" onClick={() => router.push("/dashboard/payment")}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Quay lại
                </Button>

                <div className="w-full flex flex-col items-center">

                    {/* Minimalist Header */}
                    <div className="text-center mb-10 space-y-3">
                        <div className="bg-primary/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4">
                            <QrCode className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-foreground">Thanh toán đơn hàng</h1>
                        <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                            Mở ứng dụng ngân hàng và quét mã QR bên dưới. Hệ thống sẽ xác nhận tự động.
                        </p>
                    </div>

                    <div className="w-full flex flex-col lg:flex-row gap-12 items-center lg:items-start justify-center">

                        {/* Left: QR Code Zone - No borders, no shadows */}
                        <div className="flex flex-col items-center max-w-sm w-full">
                            <div className="w-full bg-white p-2 rounded-3xl">
                                {paymentStatus.qrUrl ? (
                                    <img src={paymentStatus.qrUrl} alt="QR Code" className="w-full h-auto object-contain rounded-2xl mix-blend-multiply" />
                                ) : (
                                    <div className="w-full aspect-square bg-gray-50 flex items-center justify-center rounded-2xl">
                                        <Text color="gray">Đang tải mã QR...</Text>
                                    </div>
                                )}
                            </div>

                            {(timeLeft && !isExpired && !isConfirmed) && (
                                <Flex align="center" gap="2" mt="6" className="text-amber-600 font-medium">
                                    <CalendarClock className="w-5 h-5" />
                                    <Text size="3">Mã sẽ hết hạn sau: <span className="font-bold">{timeLeft}</span></Text>
                                </Flex>
                            )}
                            {isExpired && (
                                <Flex align="center" gap="2" mt="6" className="text-red-600 font-bold">
                                    <Text size="3">Mã QR đã hết hạn!</Text>
                                </Flex>
                            )}
                        </div>

                        {/* Right: Info Zone - Clean Typography */}
                        <div className="flex-1 w-full max-w-md space-y-8 mt-4 lg:mt-0">

                            <div className="space-y-6">
                                <Box>
                                    <Text color="gray" size="2" className="uppercase tracking-wider font-bold mb-1 block">Dịch vụ đang đăng ký</Text>
                                    <Text weight="bold" size="5" className="text-foreground">{paymentStatus.planName} Plan</Text>
                                </Box>

                                <Box>
                                    <Text color="gray" size="2" className="uppercase tracking-wider font-bold mb-1 block">Số tiền thanh toán</Text>
                                    <Text weight="bold" size="8" color="orange" className="font-black leading-none">
                                        {paymentStatus.amount?.toLocaleString()} <span className="text-2xl">VNĐ</span>
                                    </Text>
                                </Box>

                                <Box>
                                    <Text color="gray" size="2" className="uppercase tracking-wider font-bold mb-2 block">Nội dung chuyển khoản</Text>
                                    <Flex align="center" gap="3">
                                        <Badge color="blue" size="3" variant="soft" className="font-mono tracking-widest font-black text-lg px-4 py-2">
                                            FL {paymentStatus.orderCode}
                                        </Badge>
                                        <Button variant="soft" size="3" onClick={() => handleCopy(`FL ${paymentStatus.orderCode}`)} className="cursor-pointer">
                                            <Copy className="w-4 h-4" /> Copy
                                        </Button>
                                    </Flex>
                                    <p className="text-xs text-muted-foreground mt-2 italic">* Vui lòng nhập chính xác nội dung chuyển khoản để được xác nhận tự động.</p>
                                </Box>
                            </div>

                            <Flex align="center" gap="3" className="text-sm font-medium text-emerald-600 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                <ShieldCheck className="w-6 h-6 shrink-0" />
                                <p>Giao dịch được mã hóa an toàn bằng chuẩn AES-256. Không lưu trữ thông tin thẻ.</p>
                            </Flex>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}

