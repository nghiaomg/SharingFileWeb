"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader, Github, Dribbble } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
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
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void,
          ) => void;
          renderButton: (parent: HTMLElement, config: object) => void;
        };
      };
    };
  }
}

export function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const loginMutation = useLogin();
  const router = useRouter();

  const handleGithubLogin = () => {
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!githubClientId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri = "https://sharingfile.nghiaomg.xyz/auth/google/github";
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleDribbbleLogin = () => {
    const dribbbleClientId = process.env.NEXT_PUBLIC_DRIBBBLE_CLIENT_ID;
    if (!dribbbleClientId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri = "https://sharingfile.nghiaomg.xyz/auth/google/dribbble";
    window.location.href = `https://dribbble.com/oauth/authorize?client_id=${dribbbleClientId}&redirect_uri=${redirectUri}&scope=public`;
  };

  const handleZaloLogin = () => {
    const zaloAppId = process.env.NEXT_PUBLIC_ZALO_APP_ID;
    if (!zaloAppId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri = "https://sharingfile.nghiaomg.xyz/auth/google/zalo";
    window.location.href = `https://oauth.zaloapp.com/v4/permission?app_id=${zaloAppId}&redirect_uri=${redirectUri}`;
  };

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
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
    },
    [router],
  );

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
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (isSocialOpen && window.google) {
      const btnContainer = document.getElementById("google-login-button");
      if (btnContainer && btnContainer.innerHTML === "") {
        // Only render if not already rendered
        window.google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: 340,
          logo_alignment: "center",
        });
      }
    }
  }, [isSocialOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const errorMessage = loginMutation.isError
    ? getApiErrorMessage(
        loginMutation.error,
        "Sai tên đăng nhập hoặc mật khẩu!",
      )
    : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm p-4 rounded-2xl font-medium">
          {errorMessage}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold text-muted-foreground block">
          Tên đăng nhập
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
          placeholder="Nhập tên đăng nhập..."
          required
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-muted-foreground block">
            Mật khẩu
          </label>
          <Link
            href="/forgot-password"
            className="text-sm text-primary font-bold hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground pr-12 placeholder:text-muted-foreground/50"
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loginMutation.isPending || isGoogleLoading}
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
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border"></span>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground font-semibold">
            Hoặc đăng nhập bằng
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Dialog.Root open={isSocialOpen} onOpenChange={setIsSocialOpen}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="w-full py-3.5 bg-secondary text-foreground font-bold rounded-xl transition-colors hover:bg-secondary/80 cursor-pointer flex items-center justify-center gap-2 border border-border hover:border-border/80"
            >
              Continue with Social
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-card p-6 rounded-2xl shadow-xl z-50 grid gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] outline-none">
              <Dialog.Title className="text-xl font-bold text-center mb-4 text-foreground">
                Chọn tài khoản Social
              </Dialog.Title>
              <div className="flex flex-col gap-3 items-center">
                <div className="flex items-center justify-center w-full min-h-[44px]">
                  {isGoogleLoading ? (
                    <Loader className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <div
                      id="google-login-button"
                      className="flex items-center justify-center w-[340px]"
                    ></div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleGithubLogin}
                  className="w-[340px] flex items-center justify-center gap-2 py-2 border border-[#c2c8d0] rounded bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 relative"
                >
                  <Github className="w-5 h-5 text-gray-800" />
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={handleDribbbleLogin}
                  className="w-[340px] flex items-center justify-center gap-2 py-2 border border-[#ea4c89] rounded bg-[#ea4c89]/5 hover:bg-[#ea4c89]/10 transition-colors font-medium text-[#ea4c89] relative"
                >
                  <Dribbble className="w-5 h-5 text-[#ea4c89]" />
                  Continue with Dribbble
                </button>
                <button
                  type="button"
                  onClick={handleZaloLogin}
                  className="w-[340px] flex items-center justify-center gap-2 py-2 border border-[#0068FF] rounded bg-[#0068FF]/5 hover:bg-[#0068FF]/10 transition-colors font-medium text-[#0068FF] relative"
                >
                  <span className="font-extrabold text-[#0068FF] tracking-tighter text-lg leading-none">
                    Zalo
                  </span>
                  Continue with Zalo
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </form>
  );
}
