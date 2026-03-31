"use client";

import { CheckCircle2, Zap, Shield, HardDrive, Infinity, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreatePaymentMutation } from "@/features/payment/mutations";
import { usePaymentStatusQuery } from "@/features/payment/queries";
import { useCurrentUser } from "@/features/auth/queries";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState } from "react";

export default function UpgradePage() {
    const router = useRouter();
    const { data: user } = useCurrentUser();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Payment Status polling
    const { data: paymentStatus } = usePaymentStatusQuery();

    // Create new payment order mutation
    const createPaymentMutation = useCreatePaymentMutation();

    const isPro = user?.subscriptionPlan === "PRO";
    const pendingOrder = paymentStatus?.status === "PENDING" ? paymentStatus : null;

    const handleUpgradeClick = () => {
        if (pendingOrder) {
            router.push(`/payment/checkout/${pendingOrder.orderCode}`);
        } else {
            setIsConfirmOpen(true);
        }
    };

    const confirmUpgrade = async () => {
        const order = await createPaymentMutation.mutateAsync({ planName: "PRO" });
        setIsConfirmOpen(false);
        if (order?.orderCode) {
            router.push(`/payment/checkout/${order.orderCode}`);
        }
    };

    return (
        <div className="p-4 md:p-8 pb-32 h-full flex flex-col w-full">
            <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-12">
                <div className="bg-primary/10 text-primary p-3 rounded-2xl mb-6 inline-block">
                    <Crown className="w-10 h-10" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                    Nâng cấp không gian của bạn
                </h1>
                <p className="text-muted-foreground text-lg">
                    Chọn gói dung lượng phù hợp với nhu cầu lưu trữ để mở khóa đầy đủ sức mạnh của FileFlow. Tốc độ cao, bảo mật tuyệt đối.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">

                {/* Free Plan */}
                <div className="bg-card border border-border/50 rounded-3xl p-8 relative flex flex-col shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">Gói Cơ Bản</h2>
                        <div className="text-muted-foreground text-sm font-medium">Bắt đầu miễn phí mãi mãi</div>
                    </div>

                    <div className="mb-8">
                        <span className="text-5xl font-black">0đ</span>
                        <span className="text-muted-foreground font-medium">/tháng</span>
                    </div>

                    <div className="flex-1 space-y-4 mb-8">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span className="font-medium">Dung lượng lưu trữ 5.0 GB</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span className="font-medium">Tải lên tối đa 100MB / tệp</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span className="font-medium">Sử dụng tính năng cơ bản</span>
                        </div>
                    </div>

                    <button
                        className={`w-full py-4 rounded-xl border-2 font-bold transition-colors cursor-pointer ${!isPro ? "bg-secondary text-muted-foreground border-border" : "border-primary text-primary hover:bg-primary/5"}`}
                        disabled={!isPro}
                        onClick={() => router.push("/dashboard")}
                    >
                        {!isPro ? "Gói hiện tại" : "Chuyển về gói này"}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-background border-2 border-primary rounded-3xl p-8 relative flex flex-col shadow-xl shadow-primary/10 transform scale-100 lg:scale-[1.02] z-10">
                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-primary to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                        PHỔ BIẾN NHẤT
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-primary">FileFlow Pro</h2>
                            <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                        </div>
                        <div className="text-muted-foreground text-sm font-medium">Lưu trữ không giới hạn cho mọi nhu cầu</div>
                    </div>

                    <div className="mb-8">
                        <span className="text-5xl font-black text-foreground">99.000đ</span>
                        <span className="text-muted-foreground font-medium">/tháng</span>
                    </div>

                    <div className="flex-1 space-y-4 mb-8 bg-card/50 p-6 rounded-2xl border border-border/50">
                        <div className="flex items-center gap-3">
                            <HardDrive className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-bold">Lưu trữ 2.0 TB (2,000 GB)</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Infinity className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">Không giới hạn kích thước tệp tải lên</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">Băng thông tải không giới hạn</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">Mã hóa bảo vệ tệp cao cấp (AES-256)</span>
                        </div>
                    </div>

                    <button
                        className={`w-full py-4 rounded-xl font-bold shadow-md transition-all ${isPro ? "bg-card text-muted-foreground cursor-not-allowed border border-border" : "bg-primary text-white hover:bg-primary/90 hover:shadow-lg cursor-pointer"}`}
                        disabled={isPro || createPaymentMutation.isPending}
                        onClick={handleUpgradeClick}
                    >
                        {createPaymentMutation.isPending ? "Đang xử lý..." : pendingOrder ? "Tiếp tục thanh toán" : isPro ? "Đang sử dụng" : "Nâng cấp ngay"}
                    </button>

                    <p className="text-center text-xs text-muted-foreground mt-4 font-medium">Hủy bỏ bất cứ lúc nào. Không ràng buộc.</p>
                </div>

            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={confirmUpgrade}
                title="Xác nhận nâng cấp gói PRO"
                description={
                    <div className="space-y-3">
                        <p>Bạn đang tiến hành nâng cấp lên <strong>FileFlow Pro</strong> với giá <strong>99.000đ/tháng</strong>.</p>
                        <ul className="text-sm list-disc pl-5 text-muted-foreground">
                            <li>Lưu trữ không giới hạn không gian 2TB</li>
                            <li>Tăng kích thước tải lên thành không giới hạn</li>
                            <li>Băng thông bảo mật AES 256 tối đa</li>
                        </ul>
                        <p className="text-emerald-500 font-medium">Ấn Xác nhận để tiến hành tạo mã QR thanh toán.</p>
                    </div>
                }
                confirmText={createPaymentMutation.isPending ? "Đang tạo mã..." : "Mở mã QR"}
                color="gray"
                icon={<Crown className="w-6 h-6 text-primary" />}
            />

        </div>
    );
}
