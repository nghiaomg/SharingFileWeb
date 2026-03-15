"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, FolderOpen, Clock, Share2, Trash2, Settings,
    HardDrive, Crown, X, Zap, FileUp
} from "lucide-react";
import { useStorageUsage } from "@/features/auth/queries";
import { formatBytes } from "@/lib/format";

interface DashboardSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const MAX_STORAGE = 5 * 1024 * 1024 * 1024; // 5GB

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { href: "/dashboard/files", icon: FolderOpen, label: "Tệp của tôi" },
    { href: "/dashboard/recent", icon: Clock, label: "Gần đây" },
    { href: "/dashboard/shared", icon: Share2, label: "Được chia sẻ" },
    { href: "/dashboard/trash", icon: Trash2, label: "Thùng rác" },
];

const bottomItems = [
    { href: "/dashboard/settings", icon: Settings, label: "Cài đặt" },
];

export function DashboardSidebar({ isOpen, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const { data: storageData } = useStorageUsage();

    const usedStorage = storageData?.usedStorage || 0;
    const usagePercent = Math.min(100, (usedStorage / MAX_STORAGE) * 100);

    return (
        <>
            {/* Overlay on mobile */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            )}

            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border/50 flex flex-col
                transform transition-transform duration-300 ease-in-out lg:translate-x-0
                ${isOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
                    <Link href="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-primary/20">
                            <FileUp className="text-white w-5 h-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">FileFlow</span>
                    </Link>
                    <button onClick={onClose} className="lg:hidden p-1 hover:bg-secondary rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = item.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 space-y-4 border-t border-border/50">
                    {/* Storage Usage */}
                    <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-bold flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-primary" /> Lưu trữ
                            </span>
                            <span className="text-muted-foreground font-mono text-xs">
                                {formatBytes(usedStorage)} / {formatBytes(MAX_STORAGE)}
                            </span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-500"
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                        <Link
                            href="/dashboard/upgrade"
                            className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 text-primary text-sm font-bold rounded-xl hover:bg-primary/20 transition-colors"
                        >
                            <Crown className="w-4 h-4" /> Nâng cấp Pro
                        </Link>
                    </div>

                    {bottomItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}

                    <div className="text-center text-xs text-muted-foreground pt-2 flex items-center justify-center gap-1 pb-2">
                        <Zap className="w-3 h-3 text-primary" /> FileFlow v2.4.0
                    </div>
                </div>
            </aside>
        </>
    );
}
