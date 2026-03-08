"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Giả lập thời gian đăng nhập
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push("/dashboard");
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 flex flex-col items-center max-w-sm mx-auto">
            <div className="w-full space-y-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        placeholder="Email của bạn"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Lock className="w-5 h-5" />
                    </div>
                    <input
                        type="password"
                        placeholder="Mật khẩu"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>
            </div>

            <div className="flex items-center justify-between w-full">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary accent-primary" />
                    <span className="text-muted-foreground hover:text-foreground transition-colors">Ghi nhớ đăng nhập</span>
                </label>
                <Link href="/forgot" className="text-sm text-primary hover:underline font-medium">
                    Quên mật khẩu?
                </Link>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang đăng nhập...
                    </>
                ) : (
                    <>
                        Đăng nhập
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="relative flex items-center w-full py-4 text-sm text-muted-foreground">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4">Hoặc đăng nhập với</span>
                <div className="flex-1 border-t border-border"></div>
            </div>

            <div className="flex w-full gap-4">
                <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border hover:bg-secondary transition-colors font-medium">
                    <FontAwesomeIcon icon={faGoogle} className="w-5 h-5" />
                    Google
                </button>
                <button type="button" className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border hover:bg-secondary transition-colors font-medium">
                    <FontAwesomeIcon icon={faGithub} className="w-5 h-5" />
                    GitHub
                </button>
            </div>

            <p className="text-sm text-muted-foreground mt-8 text-center w-full">
                Chưa có tài khoản?{" "}
                <Link href="/signup" className="text-primary font-bold hover:underline">
                    Đăng ký ngay
                </Link>
            </p>
        </form>
    );
}
