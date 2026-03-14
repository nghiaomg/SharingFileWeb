"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle, faGithub } from "@fortawesome/free-brands-svg-icons";
import { authService } from "@/services/authService";

export function SignupForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");
        setSuccessMsg("");

        try {
            await authService.register({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });
            setSuccessMsg("Đăng ký thành công! Đang chuyển hướng đến đăng nhập...");
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            setErrorMsg(err.response?.data?.message || "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-6 flex flex-col items-center max-w-sm mx-auto">
            <div className="w-full space-y-4">
                {errorMsg && (
                    <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm text-center">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm text-center">
                        {successMsg}
                    </div>
                )}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <User className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Tên đăng nhập (Username)"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>

                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                        <Mail className="w-5 h-5" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
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
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mật khẩu"
                        className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground"
                        required
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 group disabled:opacity-50 mt-2 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        Tạo tài khoản
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>

            <div className="relative flex items-center w-full py-4 text-sm text-muted-foreground">
                <div className="flex-1 border-t border-border"></div>
                <span className="px-4">Hoặc đăng ký bằng</span>
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
                Đã có tài khoản?{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">
                    Đăng nhập
                </Link>
            </p>
        </form>
    );
}
