"use client";

import { FileText, ImageIcon, Video, HardDrive, TrendingUp, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useDashboardOverview } from "@/features/dashboard/queries";
import { formatBytes } from "@/lib/format";

const categoryIcons: Record<string, { icon: React.ElementType, color: string, bg: string }> = {
    "document": { icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    "image": { icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    "video": { icon: Video, color: "text-rose-500", bg: "bg-rose-500/10" },
    "other": { icon: HardDrive, color: "text-amber-500", bg: "bg-amber-500/10" },
};

function getCategoryUIKey(type: string): string {
    const t = type.toLowerCase();
    if (t.includes("image") || t.includes("hình")) return "image";
    if (t.includes("video")) return "video";
    if (t.includes("document") || t.includes("tài liệu") || t.includes("pdf")) return "document";
    return "other";
}

export default function DashboardPage() {
    const { data, isLoading, error } = useDashboardOverview();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Không thể tải dữ liệu tổng quan.
            </div>
        );
    }

    const categories = data?.categories || [];
    const recentFiles = data?.recentFiles || [];

    return (
        <div className="p-8 pb-32 space-y-8">
            {/* Overview Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Tổng quan</h1>
                <p className="text-muted-foreground">Xem nhanh tình trạng lưu trữ và các hoạt động gần đây.</p>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat, i) => {
                    const uiKey = getCategoryUIKey(cat.type);
                    const meta = categoryIcons[uiKey] || categoryIcons["other"];
                    const Icon = meta.icon;
                    return (
                        <div
                            key={i}
                            className="bg-card border border-border/50 rounded-2xl p-6 hover:border-border transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl ${meta.bg}`}>
                                    <Icon className={`w-6 h-6 ${meta.color}`} />
                                </div>
                                <TrendingUp className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h3 className="text-2xl font-bold mb-1">{cat.count}</h3>
                            <p className="text-muted-foreground text-sm font-medium">{cat.type}</p>
                            <p className="text-xs text-muted-foreground/70 mt-1 font-mono">{formatBytes(cat.totalSize)}</p>
                        </div>
                    );
                })}
            </div>

            {/* Recent Files */}
            <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Tệp gần đây
                    </h3>
                    <Link href="/dashboard/recent" className="text-sm font-bold text-primary hover:underline">Xem tất cả</Link>
                </div>
                <div className="divide-y divide-border/50">
                    {recentFiles.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">Chưa có tệp nào.</div>
                    ) : (
                        recentFiles.slice(0, 5).map((file) => (
                            <div key={file.id} className="flex items-center p-4 hover:bg-muted/20 transition-colors">
                                <div className="p-2.5 rounded-xl bg-blue-500/10 mr-4">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm truncate">{file.name}</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {formatBytes(file.size)} • {new Date(file.createdAt).toLocaleDateString("vi-VN")}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
