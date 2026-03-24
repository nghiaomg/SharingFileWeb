"use client";

import { useState, useEffect } from "react";
import { Bell, Loader2, FileText, X } from "lucide-react";
import { useNotifications, useUnreadCount } from "@/features/files/share-queries";
import { useMarkNotificationRead } from "@/features/files/share-mutations";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export function NotificationBell() {
    const { data: notifications = [], isLoading } = useNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();
    const markReadMutation = useMarkNotificationRead();

    const [isOpen, setIsOpen] = useState(false);

    // Close on outside click
    useEffect(() => {
        const handler = () => setIsOpen(false);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    return (
        <div className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen((prev) => !prev); }}
                className="relative p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute top-12 right-0 w-80 bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-border/50 flex items-center justify-between">
                        <h4 className="font-bold text-sm">Thông báo</h4>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded-lg transition-colors">
                            <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-border/50">
                        {isLoading ? (
                            <div className="p-6 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-6 text-center text-muted-foreground text-sm">Không có thông báo</div>
                        ) : (
                            notifications.map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => {
                                        if (!n.isRead) markReadMutation.mutate(n.id);
                                    }}
                                    className={`w-full text-left p-4 hover:bg-muted/50 transition-colors ${!n.isRead ? "bg-primary/5" : ""}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                                            <p className="text-xs text-muted-foreground/60 mt-1">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                        {!n.isRead && <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-2" />}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
