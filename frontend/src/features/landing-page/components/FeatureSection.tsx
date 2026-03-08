"use client";

import { motion } from "framer-motion";
import { Shield, Zap, RefreshCw, Smartphone, Cloud, Key } from "lucide-react";

const features = [
    {
        title: "Tốc độ ánh sáng",
        description: "Tải lên và tải xuống tệp tin với tốc độ tối đa, giúp bạn tiết kiệm thời gian đáng kể trong công việc.",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-100 dark:bg-amber-500/20",
    },
    {
        title: "Bảo mật nâng cao",
        description: "Mã hóa dữ liệu tại chỗ và trong khi truyền tải, bảo vệ thông tin nhạy cảm của bạn khỏi các tác nhân bên ngoài.",
        icon: Shield,
        color: "text-emerald-500",
        bg: "bg-emerald-100 dark:bg-emerald-500/20",
    },
    {
        title: "Quản lý phiên bản",
        description: "Tự động sao lưu lịch sử cập nhật của tệp tin, giúp bạn dễ dàng khôi phục các bản nháp trước đó bất kỳ lúc nào.",
        icon: RefreshCw,
        color: "text-indigo-500",
        bg: "bg-indigo-100 dark:bg-indigo-500/20",
    },
    {
        title: "Đa nền tảng",
        description: "Truy cập tệp tin yêu thích từ máy tính, tablet hay smartphone mọi lúc mọi nơi với trải nghiệm đồng bộ nhất.",
        icon: Smartphone,
        color: "text-rose-500",
        bg: "bg-rose-100 dark:bg-rose-500/20",
    },
    {
        title: "Lưu trữ đám mây",
        description: "Dung lượng lưu trữ lớn mở rộng linh hoạt theo nhu cầu sử dụng thực tế của doanh nghiệp hoặc cá nhân.",
        icon: Cloud,
        color: "text-sky-500",
        bg: "bg-sky-100 dark:bg-sky-500/20",
    },
    {
        title: "Chia sẻ bằng mật khẩu",
        description: "Tạo liên kết chia sẻ an toàn bằng cách yêu cầu mã PIN hoặc mật mã cho mỗi lượt truy cập cá nhân.",
        icon: Key,
        color: "text-violet-500",
        bg: "bg-violet-100 dark:bg-violet-500/20",
    },
];

export function FeatureSection() {
    return (
        <section id="features" className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative">
                <div className="text-center max-w-3xl mx-auto mb-20 px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-bold mb-6 tracking-tight"
                    >
                        Tính năng vượt trội cho trải nghiệm hoàn hảo
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground"
                    >
                        Mọi công cụ bạn cần để quản lý và chia sẻ dữ liệu một cách thông minh, nhanh chóng và an toàn nhất hiện nay.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-3xl border border-border bg-card hover:shadow-xl hover:shadow-primary/5 transition-all group"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <feature.icon className={`w-7 h-7 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
