"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader } from "lucide-react";
import { useLogin } from "@/features/auth/mutations";
import { getApiErrorMessage } from "@/types/api";

export function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const errorMessage = loginMutation.isError
    ? getApiErrorMessage(loginMutation.error, "Sai tên đăng nhập hoặc mật khẩu!")
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-4 rounded-2xl font-medium">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-muted-foreground block">Tên đăng nhập</label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
          placeholder="Nhập tên đăng nhập..."
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-sm font-bold text-muted-foreground block">Mật khẩu</label>
            <Link href="/forgot-password" className="text-sm text-primary font-bold hover:underline">
                Quên mật khẩu?
            </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground pr-12 placeholder:text-muted-foreground/50"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl transition-colors hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 border border-primary/40 hover:border-primary"
      >
        {loginMutation.isPending ? (
            <>
                <Loader className="w-5 h-5 animate-spin" /> Đang xác thực...
            </>
        ) : (
            "Đăng nhập"
        )}
      </button>

       <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border"></span></div>
        <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground font-semibold">Hoặc đăng nhập bằng</span></div>
       </div>

       <div className="grid grid-cols-2 gap-4">
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary/60 text-foreground border border-border rounded-xl hover:bg-secondary transition-colors font-medium text-sm cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.91 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.83C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.1a6.25 6.25 0 010-4.2V7.07H2.18A10.02 10.02 0 001 12c0 1.61.39 3.14 1.07 4.5l3.77-2.4z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                Google
            </button>
            <button type="button" className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary/60 text-foreground border border-border rounded-xl hover:bg-secondary transition-colors font-medium text-sm cursor-pointer">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                GitHub
            </button>
       </div>
    </form>
  );
}
