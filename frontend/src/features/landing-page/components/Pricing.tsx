"use client";

import { motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { Check, ArrowRight } from "lucide-react";

const pricing = {
    monthly: [
        {
            name: "Starter",
            price: "0đ",
            desc: "Dành cho cá nhân trải nghiệm thử dịch vụ",
            features: ["Tải lên tệp tối đa 25MB", "1GB lưu trữ đám mây", "Chia sẻ liên kết cơ bản", "Hỗ trợ cộng đồng"],
            btn: "Bắt đầu miễn phí",
            popular: false,
        },
        {
            name: "Professional",
            price: "199.000đ",
            period: "/ tháng",
            desc: "Lựa chọn tốt nhất cho người dùng chuyên nghiệp",
            features: ["Không giới hạn kích thước tệp", "50GB lưu trữ đám mây", "Bảo mật bằng mật khẩu", "Hỗ trợ ưu tiên 24/7"],
            btn: "Đăng ký ngay",
            popular: true,
        },
        {
            name: "Enterprise",
            price: "Liên hệ",
            desc: "Giải pháp tùy chỉnh cho doanh nghiệp lớn",
            features: ["Lưu trữ tùy biến", "Quản lý nhóm & phân quyền", "Mã hóa cấp quân đội", "Account Manager riêng"],
            btn: "Kết nối chuyên gia",
            popular: false,
        },
    ],
    yearly: [
        {
            name: "Starter",
            price: "0đ",
            desc: "Dành cho cá nhân trải nghiệm thử dịch vụ",
            features: ["Tải lên tệp tối đa 25MB", "1GB lưu trữ đám mây", "Chia sẻ liên kết cơ bản", "Hỗ trợ cộng đồng"],
            btn: "Bắt đầu miễn phí",
            popular: false,
        },
        {
            name: "Professional",
            price: "1.990.000đ",
            period: "/ năm",
            desc: "Tiết kiệm 2 tháng so với đăng ký tháng",
            features: ["Không giới hạn kích thước tệp", "100GB lưu trữ đám mây", "Bảo mật bằng mật khẩu", "Hỗ trợ ưu tiên 24/7"],
            btn: "Đăng ký ngay",
            popular: true,
        },
        {
            name: "Enterprise",
            price: "Liên hệ",
            desc: "Giải pháp tùy chỉnh cho doanh nghiệp lớn",
            features: ["Lưu trữ tùy biến", "Quản lý nhóm & phân quyền", "Mã hóa cấp quân đội", "Account Manager riêng"],
            btn: "Kết nối chuyên gia",
            popular: false,
        },
    ],
};

export function Pricing() {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden bg-muted/30">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-6 tracking-tight"
                    >
                        Lựa chọn gói cước phù hợp
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground"
                    >
                        Chúng tôi cung cấp các gói linh hoạt từ cá nhân đến doanh nghiệp lớn.
                    </motion.p>
                </div>

                <Tabs.Root defaultValue="monthly" className="flex flex-col items-center">
                    <Tabs.List className="inline-flex p-1 bg-muted rounded-2xl mb-12 border border-border">
                        <Tabs.Trigger
                            value="monthly"
                            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-foreground border border-transparent data-[state=active]:bg-background data-[state=active]:border-border"
                        >
                            Hàng tháng
                        </Tabs.Trigger>
                        <Tabs.Trigger
                            value="yearly"
                            className="px-6 py-2 rounded-xl text-sm font-semibold transition-all text-muted-foreground hover:text-foreground data-[state=active]:text-foreground border border-transparent data-[state=active]:bg-background data-[state=active]:border-border"
                        >
                            Hàng năm (Tiết kiệm)
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content value="monthly" className="w-full">
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {pricing.monthly.map((plan, idx) => (
                                <PricingCard key={idx} plan={plan} />
                            ))}
                        </motion.div>
                    </Tabs.Content>

                    <Tabs.Content value="yearly" className="w-full">
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {pricing.yearly.map((plan, idx) => (
                                <PricingCard key={idx} plan={plan} />
                            ))}
                        </motion.div>
                    </Tabs.Content>
                </Tabs.Root>
            </div>
        </section>
    );
}

function PricingCard({ plan }: { plan: { name: string, price: string, desc: string, features: string[], btn: string, popular: boolean, period?: string } }) {
    return (
        <div
            className={`relative p-8 rounded-[2rem] border transition-all duration-300 flex flex-col h-full bg-card hover:border-primary/60 ${plan.popular ? "border-primary scale-105" : "border-border"
                }`}
        >
            {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-white text-xs font-bold rounded-full border border-primary/30">
                    PHỔ BIẾN NHẤT
                </span>
            )}
            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                {plan.period && <span className="text-muted-foreground text-sm">{plan.period}</span>}
            </div>

            <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-foreground/80">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <button
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${plan.popular
                        ? "bg-primary text-white hover:bg-primary/90 border border-primary/40 hover:border-primary"
                        : "bg-muted text-foreground hover:bg-muted/80"
                    }`}
            >
                {plan.btn}
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );
}
