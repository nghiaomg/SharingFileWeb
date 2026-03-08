"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Folder, Clock, Share2, Trash2, Settings, FileUp, Sparkles } from "lucide-react";

const navigation = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tệp của tôi", href: "/dashboard/files", icon: Folder },
    { name: "Gần đây", href: "/dashboard/recent", icon: Clock },
    { name: "Đã chia sẻ", href: "/dashboard/shared", icon: Share2 },
    { name: "Thùng rác", href: "/dashboard/trash", icon: Trash2 },
];

export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <aside className="w-64 border-r border-border bg-card/30 flex flex-col h-full overflow-y-auto">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-primary/20">
                        <FileUp className="text-white w-5 h-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">FileFlow</span>
                </Link>
            </div>

            <div className="px-4 pb-6 border-b border-border/50">
                <button
                    onClick={() => router.push('/dashboard/files')}
                    className="w-full bg-primary text-white flex items-center justify-center gap-2 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-0.5 group cursor-pointer"
                >
                    <FileUp className="w-5 h-5 group-hover:animate-bounce-subtle" />
                    Tải lên tệp mới
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 mt-auto">
                <div className="glass bg-card/50 rounded-2xl p-4 border border-border shadow-sm mb-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Sparkles className="w-12 h-12" />
                    </div>
                    <h4 className="text-sm font-bold mb-1">Gói miễn phí</h4>
                    <div className="text-xs text-muted-foreground mb-3 font-mono">2.4 GB / 5.0 GB đã dùng</div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-gradient-to-r from-primary to-violet-500 w-[48%]" />
                    </div>
                    <Link href="/dashboard/upgrade" className="text-xs text-primary font-bold hover:underline">
                        Nâng cấp gói tài khoản
                    </Link>
                </div>

                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all"
                >
                    <Settings className="w-5 h-5" /> Cài đặt
                </Link>
            </div>
        </aside>
    );
}
