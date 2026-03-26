"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";

export function ContactForm() {
    const [turnstileToken, setTurnstileToken] = useState<string>("");

    return (
        <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Tên của bạn</label>
                    <input type="text" placeholder="Nguyễn Văn A" className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Công ty / Tổ chức</label>
                    <input type="text" placeholder="Tên doanh nghiệp" className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">Địa chỉ Email</label>
                <input type="email" placeholder="email@congty.com" className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">Mục đích liên hệ</label>
                <select className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none appearance-none">
                    <option>Đăng ký gói Doanh nghiệp (Enterprise)</option>
                    <option>Hỗ trợ kỹ thuật / Báo lỗi</option>
                    <option>Tích hợp API và Hệ thống</option>
                    <option>Yêu cầu khác</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold">Nội dung chi tiết</label>
                <textarea rows={4} placeholder="Hãy cho chúng tôi biết bạn cần hỗ trợ về vấn đề gì..." className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"></textarea>
            </div>

            <div className="space-y-4">
                <div className="flex justify-center">
                    <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                        onSuccess={(token) => setTurnstileToken(token)}
                        onError={() => setTurnstileToken("")}
                        onExpire={() => setTurnstileToken("")}
                    />
                </div>
                <button 
                    type="button" 
                    disabled={!turnstileToken}
                    className="w-full py-4 bg-foreground text-background font-bold rounded-xl transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group border border-transparent"
                >
                    Gửi yêu cầu
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </form>
    );
}
