"use client";

import { useState, useEffect } from "react";
import {
    Search, Bell, ChevronDown, User, Settings, LogOut, HelpCircle, Menu
} from "lucide-react";
import Link from "next/link";
import { useCurrentUser } from "@/features/auth/queries";
import { useLogout } from "@/features/auth/mutations";

interface DashboardHeaderProps {
    userName?: string;
    onMenuClick?: () => void;
}

export function DashboardHeader({ userName, onMenuClick }: DashboardHeaderProps) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const { data: user } = useCurrentUser();
    const logoutMutation = useLogout();

    const displayName = userName || user?.username || "Người dùng";

    useEffect(() => {
        const handleClickOutside = () => {
            setIsProfileOpen(false);
            setIsNotifOpen(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            {/* Mobile menu toggle */}
            <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-secondary rounded-lg mr-2">
                <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-xl">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tệp, thư mục..."
                        className="w-full bg-secondary/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
                {/* Notifications */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                        className="relative p-2.5 hover:bg-secondary rounded-xl transition-colors"
                    >
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-card"></span>
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                            <div className="p-4 border-b border-border flex justify-between items-center">
                                <h3 className="font-bold">Thông báo</h3>
                                <Link href="/dashboard/notifications" className="text-sm text-primary font-bold hover:underline">Xem tất cả</Link>
                            </div>
                            <div className="p-4 text-sm text-muted-foreground text-center">
                                Chưa có thông báo mới.
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotifOpen(false); }}
                        className="flex items-center gap-3 hover:bg-secondary rounded-xl px-3 py-2 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:block text-sm font-medium">{displayName}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50">
                            <div className="p-3 border-b border-border">
                                <p className="font-bold text-sm">{displayName}</p>
                                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
                            </div>
                            <div className="p-2">
                                <Link href="/dashboard/profile" className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg text-sm transition-colors w-full">
                                    <User className="w-4 h-4" /> Hồ sơ
                                </Link>
                                <Link href="/dashboard/settings" className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg text-sm transition-colors w-full">
                                    <Settings className="w-4 h-4" /> Cài đặt
                                </Link>
                                <Link href="#" className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg text-sm transition-colors w-full">
                                    <HelpCircle className="w-4 h-4" /> Trợ giúp
                                </Link>
                            </div>
                            <div className="p-2 border-t border-border">
                                <button
                                    onClick={() => logoutMutation.mutate()}
                                    className="flex items-center gap-3 p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg text-sm transition-colors w-full cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
