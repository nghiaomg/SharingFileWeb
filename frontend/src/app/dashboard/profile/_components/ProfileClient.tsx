"use client";

import { User, Mail, Calendar, MapPin, HardDrive, ShieldCheck, Activity, Star, Clock, Crown, Zap, Shield, FileText, Loader2, Save, X, Edit2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSuspenseCurrentUser, useSuspenseStorageUsage } from "@/features/auth/queries";
import { useUpdateProfile } from "@/features/auth/mutations";
import { getApiErrorMessage } from "@/types/api";

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

function formatDate(dateStr?: string) {
    if (!dateStr) return 'Chưa cập nhật';
    return new Date(dateStr).toLocaleDateString('vi-VN');
}

function formatDateTime(dateStr?: string) {
    if (!dateStr) return 'Chưa cập nhật';
    return new Date(dateStr).toLocaleString('vi-VN');
}

export function ProfileClient() {
    const { data: user } = useSuspenseCurrentUser();
    const { data: storageStats } = useSuspenseStorageUsage();
    const updateProfileMutation = useUpdateProfile();
    
    const [isEditing, setIsEditing] = useState(false);
    const [editEmail, setEditEmail] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleStartEdit = () => {
        setEditEmail(user?.email || "");
        setIsEditing(true);
        setSuccessMsg("");
    };

    const handleSaveProfile = () => {
        updateProfileMutation.mutate({ email: editEmail }, {
            onSuccess: () => {
                setSuccessMsg("Cập nhật thông tin thành công!");
                setIsEditing(false);
            },
        });
    };

    const isAdmin = user.roles?.includes("ROLE_ADMIN");
    const errorMsg = updateProfileMutation.isError ? getApiErrorMessage(updateProfileMutation.error, "Đã xảy ra lỗi khi cập nhật.") : "";

    const usedStorage = storageStats?.usedStorage || 0;
    const maxStorage = user.maxStorage || (5 * 1024 * 1024 * 1024);
    const storagePercent = maxStorage > 0 ? Math.round((usedStorage / maxStorage) * 100) : 0;

    return (
        <div className="w-full h-full">
            {/* Header Profile Banner */}
            <div className="relative rounded-3xl overflow-hidden mb-8 border border-border/50 bg-card">
                <div className="h-48 w-full bg-gradient-to-r from-violet-600 via-primary to-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
                    {isAdmin ? (
                        <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-rose-500/50 text-white text-xs font-bold flex items-center gap-2">
                            <Crown className="w-4 h-4 text-rose-400" /> Quản trị viên
                        </div>
                    ) : (
                        <div className="absolute top-4 right-4 bg-background/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs font-bold flex items-center gap-2">
                             Thành viên Tiêu chuẩn
                        </div>
                    )}
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
                        <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
                        <div className="text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-4">
                            <span className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={editEmail}
                                        onChange={(e) => setEditEmail(e.target.value)}
                                        className="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-64"
                                    />
                                ) : (
                                    <span>{user.email}</span>
                                )}
                            </span>
                            {!isEditing && <span className="hidden sm:flex items-center gap-1"><MapPin className="w-4 h-4" /> Vietnam</span>}
                        </div>
                        {errorMsg && <p className="text-rose-500 text-sm mt-2">{errorMsg}</p>}
                        {successMsg && <p className="text-emerald-500 text-sm mt-2">{successMsg}</p>}
                    </div>

                    <div className="flex gap-3 mb-2">
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} disabled={updateProfileMutation.isPending} className="px-4 py-2 bg-secondary text-foreground font-bold rounded-xl border border-transparent hover:border-gray-300 transition-colors text-sm whitespace-nowrap">
                                    <X className="w-4 h-4 inline mr-1" /> Hủy
                                </button>
                                <button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} className="px-6 py-2 bg-primary text-white font-bold rounded-xl border border-transparent hover:border-primary/80 transition-colors text-sm flex items-center gap-2 whitespace-nowrap">
                                    {updateProfileMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu
                                </button>
                            </>
                        ) : (
                            <button onClick={handleStartEdit} className="px-6 py-2.5 bg-secondary text-foreground font-bold rounded-xl border border-transparent hover:border-gray-200 transition-colors text-sm flex items-center gap-2">
                                <Edit2 className="w-4 h-4 inline" /> Chỉnh sửa hồ sơ
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stats & Info */}
                <div className="space-y-8">
                    {/* Storage Stats */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                            <HardDrive className="w-5 h-5 text-primary" /> Tổng quan lưu trữ
                        </h3>
                        <div className="relative w-40 h-40 mx-auto mb-6 flex justify-center items-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-secondary" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset={440 - (440 * storagePercent) / 100} className="text-primary stroke-current" strokeLinecap="round" />
                            </svg>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                <span className="text-3xl font-extrabold text-primary">{storagePercent}%</span>
                                <span className="block text-xs text-muted-foreground font-bold">Đã dùng</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium mb-2">
                            <span>{formatBytes(usedStorage)}</span>
                            <span className="text-muted-foreground">{formatBytes(maxStorage)}</span>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Bảo mật & Hoạt động
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Ngày tham gia</span>
                                <span className="font-semibold">{formatDate(user.createdAt)}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4" /> Đăng nhập lần cuối</span>
                                <span className="font-semibold text-emerald-500">{formatDateTime(user.lastLogin)}</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-2"><Shield className="w-4 h-4" /> Xác thực 2 bước</span>
                                {user.twoFactorEnabled ? (
                                    <span className="font-semibold px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 text-xs">Đã bật</span>
                                ) : (
                                    <span className="font-semibold px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20 text-xs">Chưa bật</span>
                                )}
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column: Activity & Badges */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Gamification / Badges */}
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
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
                    <div className="bg-card border border-border/50 rounded-3xl p-6">
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
