"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, UploadCloud, FileText, Folder, Link as LinkIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Hero() {
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center pt-32 pb-20 overflow-hidden hero-gradient">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-zinc-600/10 rounded-full blur-[100px] -z-10" />

            <div className="container mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid lg:grid-cols-2 gap-16 items-center"
                >
                    <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
                            <Zap className="w-3 h-3 fill-primary" />
                            <span>Nhanh chóng & Bảo mật</span>
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] tracking-tight text-foreground">
                            Giải pháp lưu trữ & <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-zinc-500 to-indigo-500">Chia sẻ tệp tin</span> thế hệ mới
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg">
                            Tải lên, cập nhật phiên bản và chia sẻ tệp tin của bạn chỉ trong vài giây. Bảo mật tuyệt đối với mã hóa đầu cuối và hệ thống quản lý quyền truy cập thông minh.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 border border-primary/40 hover:border-primary"
                            >
                                Bắt đầu tải tệp lên
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="#features"
                                className="w-full sm:w-auto px-8 py-4 bg-background border border-border text-foreground font-semibold rounded-2xl hover:bg-muted/50 transition-all text-center"
                            >
                                Tìm hiểu thêm
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants} className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                                        <div className={`w-full h-full bg-gradient-to-tr from-primary/40 to-zinc-400 group-hover:scale-110 transition-transform`} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-foreground">
                                <span className="font-bold">10k+</span> người dùng tin dùng
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        variants={itemVariants}
                        className="relative lg:h-[600px] w-full max-w-[600px] mx-auto perspective-1000"
                    >
                        {/* Main Mockup Card */}
                        <div className="relative z-10 w-full h-[500px] mt-10 rounded-[2.5rem] overflow-hidden glass border border-white/20 animate-float bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl flex flex-col items-center justify-center p-8">

                            {/* Inner Drag and Drop Area */}
                            <div className="w-full h-full rounded-3xl border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center relative overflow-hidden group hover:bg-primary/10 transition-colors duration-500">
                                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform duration-500">
                                    <UploadCloud className="w-12 h-12 text-primary" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-foreground tracking-tight">Kéo thả tệp vào đây</h3>
                                <p className="text-muted-foreground text-center px-4 max-w-sm">
                                    Hỗ trợ tải lên siêu tốc với mã hóa đầu cuối. <br /> Kích thước tối đa: <span className="font-semibold text-foreground">50GB</span>
                                </p>

                                <button className="mt-8 px-6 py-3 bg-foreground text-background rounded-full font-medium border border-border transition-colors hover:bg-foreground/90">
                                    Chọn tệp từ máy tính
                                </button>
                            </div>
                        </div>

                        {/* Floating Card 1: Upload Progress */}
                        <motion.div
                            initial={{ opacity: 0, x: 50, y: -20 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="absolute -right-8 top-20 z-20 w-72 p-5 rounded-2xl glass border border-white/30 bg-white/60 dark:bg-black/40 backdrop-blur-2xl animate-float"
                            style={{ animationDelay: '1s' }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-500/20 flex items-center justify-center border border-zinc-500/30">
                                    <FileText className="w-6 h-6 text-zinc-900 dark:text-zinc-100" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold truncate">Q3_Financial_R...pdf</h4>
                                    <p className="text-xs text-muted-foreground">Đang tải lên... 85%</p>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-primary to-zinc-500 w-[85%] rounded-full relative">
                                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Floating Card 2: Secure Share Link */}
                        <motion.div
                            initial={{ opacity: 0, x: -50, y: 50 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ delay: 1.2, duration: 0.8 }}
                            className="absolute -left-12 bottom-20 z-20 w-80 p-5 rounded-3xl glass border border-white/30 bg-white/60 dark:bg-black/40 backdrop-blur-2xl animate-float"
                            style={{ animationDelay: '2s' }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    <span className="text-sm font-semibold text-emerald-500">Đã mã hóa an toàn</span>
                                </div>
                                <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">Hết hạn: 7 ngày</span>
                            </div>
                            <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border">
                                <LinkIcon className="w-5 h-5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground truncate flex-1">fileflow.io/s/x7a9...</span>
                                <button className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border border-primary/30">
                                    Sao chép
                                </button>
                            </div>
                        </motion.div>

                        {/* Floating Card 3: Storage usage */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 0.8 }}
                            className="absolute right-12 bottom-4 z-0 w-48 p-4 rounded-3xl glass border border-white/20 bg-white/40 dark:bg-black/30 backdrop-blur-xl"
                        >
                            <div className="flex justify-between items-center mb-2">
                                <Folder className="w-5 h-5 text-primary" />
                                <span className="text-xs font-bold font-mono">24/50 GB</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Đã sử dụng không gian gốc</p>
                        </motion.div>

                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
