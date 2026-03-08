"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Search, User, CheckCircle2, FileUp, Share2, AlertCircle } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const notifications = [
        { id: 1, type: "upload", title: "Tải lên hoàn tất", desc: "Tệp 'Project_Media.zip' đã được lưu trữ an toàn.", time: "2 phút trước", icon: FileUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: 2, type: "share", title: "Được chia sẻ mới", desc: "Nguyễn Thị B đã chia sẻ thư mục 'Marketing_Assets' với bạn.", time: "1 giờ trước", icon: Share2, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: 3, type: "alert", title: "Sắp đầy bộ nhớ", desc: "Bạn đã dùng 90% dung lượng lưu trữ của gói Pro Plan.", time: "Hôm qua", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];

    return (
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
            <div className="flex-1 max-w-xl relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Tìm kiếm tệp, thư mục hoặc loại tệp..."
                    className="w-full bg-secondary/50 border border-border pl-12 pr-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                />
            </div>

            <div className="flex items-center gap-6 ml-4 shrink-0">
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-2 rounded-xl transition-all ${showNotifications ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                    >
                        <Bell className="w-6 h-6" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-background animate-pulse" />
                    </button>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-80 md:w-96 bg-card border border-border/50 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                            <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/30">
                                <h3 className="font-bold">Thông báo</h3>
                                <button className="text-xs text-primary hover:underline font-medium">Đánh dấu đã đọc</button>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto">
                                {notifications.length > 0 ? (
                                    <div className="divide-y divide-border/50">
                                        {notifications.map(notif => (
                                            <div key={notif.id} className="p-4 hover:bg-muted/20 transition-colors flex gap-4 cursor-pointer group">
                                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border border-border/50 ${notif.bg}`}>
                                                    <notif.icon className={`w-5 h-5 ${notif.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm text-foreground mb-0.5">{notif.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-1.5">{notif.desc}</p>
                                                    <span className="text-[10px] text-muted-foreground/70 font-semibold">{notif.time}</span>
                                                </div>
                                                <div className="shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 hover:bg-background rounded-lg text-muted-foreground hover:text-emerald-500 transition-colors" title="Đánh dấu đã đọc">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
                                        <Bell className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-sm font-medium">Bạn không có thông báo nào mới</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-3 border-t border-border/50 text-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                                <Link href="/dashboard/notifications" onClick={() => setShowNotifications(false)} className="text-sm font-bold text-primary block w-full">
                                    Xem tất cả thông báo
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                <div className="h-8 w-px bg-border hidden sm:block" />

                <Link href="/dashboard/profile" className="flex items-center gap-3 group">
                    <div className="text-right hidden sm:block">
                        <div className="text-sm font-bold group-hover:text-primary transition-colors">Trung Nghĩa</div>
                        <div className="text-xs text-muted-foreground">Pro Plan</div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-violet-500 p-[2px]">
                        <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
                            <User className="w-5 h-5 text-foreground" />
                        </div>
                    </div>
                </Link>
            </div>
        </header>
    );
}
