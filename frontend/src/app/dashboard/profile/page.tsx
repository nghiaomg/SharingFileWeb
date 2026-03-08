import { User, Mail, Calendar, MapPin, HardDrive, ShieldCheck, Activity, Star, Clock, Crown, Zap, Shield, FileText } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    return (
        <div className="p-8 pb-32 w-full h-full overflow-y-auto">
            {/* Header Profile Banner */}
            <div className="relative rounded-3xl overflow-hidden mb-8 border border-border/50 shadow-sm bg-card">
                <div className="h-48 w-full bg-gradient-to-r from-violet-600 via-primary to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
                    <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-300" /> Thành viên FileFlow Pro
                    </div>
                </div>

                <div className="px-8 pb-8 relative flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 sm:-mt-20">
                    <div className="relative p-2 bg-card rounded-full border border-border">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-violet-500 p-[3px]">
                            <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                                <User className="w-16 h-16 text-foreground" />
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4 w-5 h-5 bg-emerald-500 border-4 border-card rounded-full" title="Đang trực tuyến"></div>
                    </div>

                    <div className="flex-1 text-center sm:text-left mb-2">
                        <h1 className="text-3xl font-bold mb-1">Trung Nghĩa</h1>
                        <p className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-4">
                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> trungnghia@example.com</span>
                            <span className="hidden sm:flex items-center gap-1"><MapPin className="w-4 h-4" /> TP. Hồ Chí Minh</span>
                        </p>
                    </div>

                    <div className="flex gap-3 mb-2">
                        <Link href="/dashboard/settings" className="px-6 py-2.5 bg-secondary text-foreground font-bold rounded-xl hover:bg-secondary/80 transition-colors shadow-sm text-sm">
                            Chỉnh sửa hồ sơ
                        </Link>
                        <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg hover:shadow-primary/30 text-sm flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Nâng cấp
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="space-y-8">
                    {/* Storage Stats */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <HardDrive className="w-5 h-5 text-primary" /> Tổng quan lưu trữ
                        </h3>

                        {/* Circular Progress (Stylized) */}
                        <div className="relative w-40 h-40 mx-auto mb-6 flex justify-center items-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="240" className="text-primary stroke-current" strokeLinecap="round" />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-3xl font-extrabold text-primary">45%</span>
                                <span className="block text-xs text-muted-foreground font-bold">Đã dùng</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm font-medium mb-2">
                            <span>2.4 GB</span>
                            <span className="text-muted-foreground">5.0 GB</span>
                        </div>

                        <div className="space-y-3 mt-6 pt-6 border-t border-border/50">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div> Tài liệu</div>
                                <span className="text-muted-foreground font-mono">1.2 GB</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div> Hình ảnh</div>
                                <span className="text-muted-foreground font-mono">800 MB</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full"></div> Video</div>
                                <span className="text-muted-foreground font-mono">400 MB</span>
                            </div>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Bảo mật & Hoạt động
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày tham gia</span>
                                <span className="font-semibold">01/01/2024</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Đăng nhập lần cuối</span>
                                <span className="font-semibold text-emerald-500">Vừa xong</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Xác thực 2 bước</span>
                                <span className="font-semibold px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-lg text-xs">Chưa bật</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Activity & Badges */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Gamification / Badges */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <Star className="w-5 h-5 text-amber-500" /> Thành tích đóng góp
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex flex-col items-center justify-center p-4 border border-primary/20 bg-primary/5 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                                    <HardDrive className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-xl font-bold">120+</span>
                                <span className="text-xs text-muted-foreground font-medium text-center">Tệp đã tải lên</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
                                    <Zap className="w-6 h-6 text-emerald-500" />
                                </div>
                                <span className="text-xl font-bold">50+</span>
                                <span className="text-xs text-muted-foreground font-medium text-center">Lượt chia sẻ</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border border-violet-500/20 bg-violet-500/5 rounded-2xl">
                                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-3">
                                    <Star className="w-6 h-6 text-violet-500" />
                                </div>
                                <span className="text-xl font-bold">VIP</span>
                                <span className="text-xs text-muted-foreground font-medium text-center">Người dùng Tích cực</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-4 border border-border/50 bg-secondary/50 rounded-2xl opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <Crown className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <span className="text-xl font-bold">???</span>
                                <span className="text-xs text-muted-foreground font-medium text-center">Chưa mở khóa</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline / Recent Activity log */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" /> Nhật ký hoạt động
                            </h3>
                            <Link href="/dashboard/recent" className="text-sm font-bold text-primary hover:underline">Xem tất cả</Link>
                        </div>

                        <div className="relative pl-6 border-l-2 border-border/50 space-y-8">
                            <div className="relative">
                                <div className="absolute -left-[31px] w-4 h-4 bg-background border-2 border-primary rounded-full ring-4 ring-primary/20"></div>
                                <p className="text-xs text-muted-foreground mb-1 font-medium">Hôm nay, 14:30</p>
                                <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                                    <p className="text-sm">Bạn đã tải lên tệp <span className="font-bold text-primary flex items-inline inline-flex px-1"><FileText className="w-4 h-4 inline mr-1" /> Ban_ke_hoach_kinh_doanh_2024.pdf</span></p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[31px] w-4 h-4 bg-background border-2 border-emerald-500 rounded-full"></div>
                                <p className="text-xs text-muted-foreground mb-1 font-medium">Hôm qua, 09:15</p>
                                <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                                    <p className="text-sm">Tài khoản của bạn đã được nâng cấp lên gói <span className="font-bold text-emerald-500 flex items-inline inline-flex px-1"><Crown className="w-4 h-4 inline mr-1" /> FileFlow Pro</span></p>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-[31px] w-4 h-4 bg-background border-2 border-rose-500 rounded-full"></div>
                                <p className="text-xs text-muted-foreground mb-1 font-medium">Tuần trước, T4</p>
                                <div className="bg-secondary/50 p-4 rounded-xl border border-border/50">
                                    <p className="text-sm">Xóa 12 tệp cũ vào Thùng rác để giải phóng <span className="font-mono font-bold">2.4 GB</span> dung lượng tĩnh.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
