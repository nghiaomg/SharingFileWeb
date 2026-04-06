"use client";

import { useState } from "react";
import { Github, Dribbble, Eye, EyeOff, Loader2 } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useLogin } from "../mutations";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const handleGithubLogin = (): void => {
    const githubClientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    if (!githubClientId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri =
      (process.env.NEXT_PUBLIC_GITHUB_CALLBACK_URL || "").trim() ||
      (typeof window !== "undefined"
        ? window.location.origin + "/auth/github/callback"
        : "https://sharingfile.nghiaomg.xyz/auth/github/callback");
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  const handleDribbbleLogin = (): void => {
    const dribbbleClientId = process.env.NEXT_PUBLIC_DRIBBBLE_CLIENT_ID;
    if (!dribbbleClientId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri =
      (process.env.NEXT_PUBLIC_DRIBBBLE_CALLBACK_URL || "").trim() ||
      (typeof window !== "undefined"
        ? window.location.origin + "/auth/dribbble/callback"
        : "https://sharingfile.nghiaomg.xyz/auth/dribbble/callback");
    window.location.href = `https://dribbble.com/oauth/authorize?client_id=${dribbbleClientId}&redirect_uri=${redirectUri}&scope=public`;
  };

  /* const handleZaloLogin = (): void => {
    const zaloAppId = process.env.NEXT_PUBLIC_ZALO_APP_ID;
    if (!zaloAppId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri =
      (process.env.NEXT_PUBLIC_ZALO_CALLBACK_URL || "").trim() ||
      (typeof window !== "undefined"
        ? window.location.origin + "/auth/zalo/callback"
        : "https://sharingfile.nghiaomg.xyz/auth/zalo/callback");
    const state =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : "zalo_secure_state_12345";
    window.location.href = `https://oauth.zaloapp.com/v4/permission?app_id=${zaloAppId}&redirect_uri=${redirectUri}&state=${state}`;
  }; */

  const handleGoogleLogin = (): void => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      toast.error("Tính năng này đang bảo trì do thiếu cấu hình.");
      return;
    }
    const redirectUri =
      (process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL || "").trim() ||
      (typeof window !== "undefined"
        ? window.location.origin + "/auth/google/callback"
        : "https://sharingfile.nghiaomg.xyz/auth/google/callback");
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("email profile")}`;
  };

  const handleCredentialsLogin = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
      return;
    }
    login(
      { username, password },
      {
        onError: (error: unknown) => {
          const err = error as AxiosError<{ message?: string }>;
          toast.error(err.response?.data?.message || "Đăng nhập thất bại");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCredentialsLogin} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Tài khoản
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
            placeholder="Nhập tên đăng nhập"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2 relative">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Mật khẩu
            </label>
            <a
              href="#"
              className="text-sm text-primary hover:underline font-medium"
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12 text-foreground"
              placeholder="Nhập mật khẩu"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              disabled={isPending}
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
          className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Đăng nhập"
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">
            Hoặc đăng nhập bằng
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-8">
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="w-full py-3.5 bg-secondary text-foreground font-bold rounded-xl transition-colors hover:bg-secondary/80 cursor-pointer flex items-center justify-center gap-2 border border-border hover:border-border/80"
            >
              Tài khoản mạng xã hội (Social)
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-card p-6 rounded-2xl shadow-xl z-50 grid gap-4 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] outline-none">
              <Dialog.Title className="text-xl font-bold text-center mb-4 text-foreground">
                Chọn tài khoản Social
              </Dialog.Title>
              <div className="flex flex-col gap-3 items-center">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-[340px] flex items-center justify-center gap-2 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 transition-colors font-medium text-gray-700 relative"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
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
                {/* <button
                  type="button"
                  onClick={handleZaloLogin}
                  className="w-[340px] flex items-center justify-center gap-2 py-2 border border-[#0068FF] rounded bg-[#0068FF]/5 hover:bg-[#0068FF]/10 transition-colors font-medium text-[#0068FF] relative"
                >
                  <span className="font-extrabold text-[#0068FF] tracking-tighter text-lg leading-none">
                    Zalo
                  </span>
                  Continue with Zalo
                </button> */}{" "}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
