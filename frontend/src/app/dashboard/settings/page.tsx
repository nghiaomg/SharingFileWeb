import { Settings, User, Bell, Shield, Key, CreditCard, LogOut, HardDrive } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    return (
        <div className="p-8 pb-32 max-w-4xl mx-auto flex flex-col items-center">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-12 self-start">
                <Settings className="w-8 h-8 text-primary/80" /> Cài đặt & Hồ sơ
            </h1>

            <div className="w-full flex flex-col md:flex-row gap-12 items-start justify-center">
                {/* Right side settings content first logically but rendered on the left or center based on viewport */}
                <div className="flex-1 space-y-6 w-full max-w-2xl mx-auto">
                    {/* General Profile */}
                    <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm">
                        <div className="flex items-center gap-6 mb-8 border-b border-border/50 pb-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-violet-500 p-[3px]">
                                    <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                                        <User className="w-10 h-10 text-foreground" />
                                    </div>
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-background border border-border rounded-full shadow-md text-sm text-primary hover:scale-110 transition-transform">
                                    Sửa
                                </button>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Trung Nghĩa</h3>
                                <p className="text-muted-foreground mt-1">trungnghia@example.com</p>
                                <span className="inline-block px-3 py-1 mt-3 text-xs font-bold text-primary bg-primary/10 rounded-full border border-primary/20">
                                    PRO PLAN
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Tên hiển thị</label>
                                    <input type="text" defaultValue="Trung Nghĩa" className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-muted-foreground mb-1 block">Số điện thoại</label>
                                    <input type="tel" placeholder="+84 ..." className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all" />
                                </div>
                            </div>
                            <div className="pt-4 text-right">
                                <button className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30">
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Settings */}
                    <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-lg">Gói lưu trữ</h4>
                        </div>

                        <div className="glass bg-primary/5 border border-primary/20 rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <div className="text-xl font-bold">FileFlow Pro</div>
                                    <div className="text-sm text-muted-foreground leading-relaxed mt-1">Kỳ gia hạn tiếp theo: 24 Tháng 05, 2024</div>
                                </div>
                                <div className="text-2xl font-extrabold text-primary">$9.99<span className="text-base text-muted-foreground font-medium">/tháng</span></div>
                            </div>

                            <div className="flex gap-4">
                                <Link href="#" className="font-bold text-sm bg-background border border-border px-4 py-2 rounded-lg hover:bg-secondary">
                                    Quản lý hóa đơn
                                </Link>
                                <Link href="#" className="font-bold text-sm text-primary px-4 py-2 rounded-lg hover:bg-primary/10">
                                    Nâng cấp gói
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-card border border-border/50 rounded-3xl p-8 shadow-sm space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/10 text-emerald-500 p-2 rounded-lg">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h4 className="font-bold text-lg">Bảo mật tài khoản</h4>
                        </div>
                        <div className="divide-y divide-border/50">
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold">Đổi mật khẩu</h5>
                                    <p className="text-sm text-muted-foreground mt-1">Cập nhật mật khẩu mới 6 tháng một lần</p>
                                </div>
                                <button className="font-bold text-sm bg-secondary px-4 py-2 rounded-lg">Cập nhật</button>
                            </div>
                            <div className="py-4 flex items-center justify-between">
                                <div>
                                    <h5 className="font-bold">Xác thực 2 bước (2FA)</h5>
                                    <p className="text-sm text-muted-foreground mt-1 text-rose-500">Chưa kích hoạt</p>
                                </div>
                                <button className="font-bold text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">Bật ngay</button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button className="flex items-center gap-2 text-rose-500 font-bold px-4 py-2 rounded-xl hover:bg-rose-500/10 transition-colors">
                            <LogOut className="w-5 h-5" /> Đăng xuất khỏi thiết bị này
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
