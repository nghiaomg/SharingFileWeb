"use client";

import { Bell, Search, User } from "lucide-react";
import Link from "next/link";

export function DashboardHeader() {
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
                <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
                </button>

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
