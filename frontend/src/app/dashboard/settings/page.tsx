"use client";

import { useState } from "react";
import { Settings, User, Shield, CreditCard, LogOut, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [passwordSent, setPasswordSent] = useState(false);

    const handleSaveProfile = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        }, 1500);
    };

    const handleLogout = () => {
        // Here we could clear auth tokens if any existed
        router.push("/login");
    };

    return (
        <div className="p-8 pb-32 w-full h-full overflow-y-auto relative">
            {/* Success Toast */}
            {savedSuccess && (
                <div className="fixed bottom-8 right-8 bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 z-50">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-bold">Hồ sơ đã được lưu thành công!</span>
                </div>
            )}

            <h1 className="text-3xl font-bold flex items-center gap-3 mb-12 self-start">
                <Settings className="w-8 h-8 text-primary/80" /> Cài đặt & Hồ sơ
            </h1>

            <div className="w-full flex flex-col md:flex-row gap-12 items-start justify-center">
                {/* Right side settings content first logically but rendered on the left or center based on viewport */}
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
                        {/* Column 1: Profile & Security */}
                        <div className="flex flex-col gap-8 xl:col-span-2">
                            {/* General Profile */}
                            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 border-b border-border/50 pb-8">
                                    <div className="relative shrink-0">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-violet-500 p-[3px]">
                                            <div className="w-full h-full bg-background rounded-full flex items-center justify-center overflow-hidden">
                                                <User className="w-10 h-10 text-foreground" />
                                            </div>
                                        </div>
                                        <button className="absolute bottom-0 right-0 p-2 bg-background border border-border rounded-full shadow-md text-sm text-primary hover:scale-110 transition-transform cursor-pointer">
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

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Tên hiển thị</label>
                                            <input type="text" defaultValue="Trung Nghĩa" className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Số điện thoại</label>
                                            <input type="tel" placeholder="+84 ..." className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Quốc gia</label>
                                            <input type="text" defaultValue="Việt Nam" className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-muted-foreground mb-2 block">Công ty / Tổ chức</label>
                                            <input type="text" placeholder="Nhập tên tổ chức..." className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground" />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex justify-end">
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Lưu thay đổi hồ sơ"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-emerald-500/10 text-emerald-500 p-2.5 rounded-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Bảo mật tài khoản</h4>
                                        <p className="text-sm text-muted-foreground">Quản lý lớp bảo vệ cho dữ liệu của bạn</p>
                                    </div>
                                </div>
                                <div className="divide-y divide-border/50 border-t border-border/50">
                                    <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h5 className="font-bold">Đổi mật khẩu</h5>
                                            <p className="text-sm text-muted-foreground mt-1">Cập nhật mật khẩu mới 6 tháng một lần để an toàn</p>
                                        </div>
                                        <button
                                            onClick={() => setPasswordSent(true)}
                                            className="font-bold text-sm bg-secondary px-5 py-2.5 rounded-xl hover:bg-secondary/80 transition-colors cursor-pointer shrink-0"
                                        >
                                            {passwordSent ? <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Đã gửi email</span> : "Cập nhật mã"}
                                        </button>
                                    </div>
                                    <div className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h5 className="font-bold">Xác thực 2 bước (2FA)</h5>
                                            {is2FAEnabled ? (
                                                <p className="text-sm mt-1 text-emerald-500 font-medium">Đang kích hoạt - Bảo mật cao</p>
                                            ) : (
                                                <p className="text-sm mt-1 text-rose-500 font-medium">Chưa kích hoạt - Nguy cơ rủi ro cao</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
                                            className={`font-bold text-sm px-5 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 ${is2FAEnabled ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"}`}
                                        >
                                            {is2FAEnabled ? "Tắt 2FA" : "Bật ngay"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Subscription & Actions */}
                        <div className="flex flex-col gap-8">
                            {/* Subscription Settings */}
                            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-amber-500/10 text-amber-500 p-2.5 rounded-xl">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Gói lưu trữ</h4>
                                        <p className="text-sm text-muted-foreground">Thông tin thanh toán & gia hạn</p>
                                    </div>
                                </div>

                                <div className="glass bg-primary/5 border border-primary/20 rounded-2xl p-6">
                                    <div className="flex flex-col gap-4 mb-6">
                                        <div>
                                            <div className="text-2xl font-extrabold text-primary flex items-center gap-2">
                                                FileFlow Pro
                                                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold relative -top-1">HOT</span>
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-2 font-medium">Chu kỳ tiếp theo: 24/05/2024</div>
                                        </div>
                                        <div className="text-3xl font-extrabold text-foreground mt-2">$9.99<span className="text-base text-muted-foreground font-medium">/tháng</span></div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <Link href="#" className="font-bold justify-center text-sm text-primary bg-primary/10 border border-primary/20 px-4 py-3 rounded-xl hover:bg-primary hover:text-white transition-all text-center cursor-pointer">
                                            Nâng cấp gói doanh nghiệp
                                        </Link>
                                        <Link href="/dashboard/billing" className="font-bold justify-center text-sm bg-background border border-border px-4 py-3 rounded-xl hover:bg-secondary transition-colors text-center cursor-pointer">
                                            Quản lý hóa đơn
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="pt-4">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center justify-center w-full gap-3 text-rose-500 font-bold px-4 py-3 rounded-2xl hover:bg-rose-500 hover:text-white border border-rose-500/30 transition-all cursor-pointer shadow-sm hover:shadow-rose-500/30 group"
                                >
                                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    Đăng xuất khỏi thiết bị này
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
