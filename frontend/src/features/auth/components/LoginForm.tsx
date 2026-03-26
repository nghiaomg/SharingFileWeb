"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useLogin } from "@/features/auth/mutations";
import { loginWithGoogle } from "@/features/auth/api";
import { getApiErrorMessage } from "@/types/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          renderButton: (parent: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "", turnstileToken: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginMutation = useLogin();
  const router = useRouter();

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(response.credential);
      toast.success("Đăng nhập Google thành công!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
      toast.error("Đăng nhập Google thất bại!");
    } finally {
      setIsGoogleLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        
        const btnContainer = document.getElementById("google-login-button");
        if (btnContainer) {
            window.google.accounts.id.renderButton(btnContainer, {
                theme: "outline",
                size: "large",
                text: "continue_with",
                width: 340,
                logo_alignment: "center"
            });
        }
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [handleCredentialResponse]);

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

      <div className="flex justify-center mb-4">
        <Turnstile
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={(token) => setFormData({ ...formData, turnstileToken: token })}
          onError={() => setFormData({ ...formData, turnstileToken: "" })}
          onExpire={() => setFormData({ ...formData, turnstileToken: "" })}
        />
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending || isGoogleLoading || !formData.turnstileToken}
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

       <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center w-full min-h-[44px]">
                {isGoogleLoading ? (
                    <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                    <div id="google-login-button" className="flex items-center justify-center w-full"></div>
                )}
            </div>
       </div>
    </form>
  );
}
