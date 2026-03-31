"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader, Check } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useRegister } from "@/features/auth/mutations";
import { getApiErrorMessage } from "@/types/api";

export function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (formData.password !== formData.confirmPassword) {
      setLocalError("Mật khẩu xác nhận không khớp!");
      return;
    }

    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      turnstileToken,
    });
  };

  const errorMessage =
    localError ||
    (registerMutation.isError
      ? getApiErrorMessage(registerMutation.error, "Đã xảy ra lỗi khi đăng ký!")
      : "");

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {registerMutation.isSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-sm p-4 rounded-2xl font-medium flex items-center gap-2">
          <Check className="w-4 h-4" /> Đăng ký thành công! Đang chuyển sang
          trang đăng nhập...
        </div>
      )}

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
          placeholder="Chọn tên người dùng"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-muted-foreground block">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
          placeholder="name@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-muted-foreground block">
          Mật khẩu
        </label>
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

      <div className="space-y-2">
        <label className="text-sm font-bold text-muted-foreground block">
          Xác nhận mật khẩu
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="w-full px-4 py-3 bg-secondary/60 border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="flex items-start gap-3 py-2">
        <input type="checkbox" required className="mt-1 accent-primary" />
        <span className="text-sm text-muted-foreground">
          Tôi đồng ý với{" "}
          <Link
            href="/terms"
            className="text-primary font-bold hover:underline"
          >
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link
            href="/privacy"
            className="text-primary font-bold hover:underline"
          >
            Chính sách bảo mật
          </Link>
          .
        </span>
      </div>

      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setTurnstileToken(token)}
        onExpire={() => setTurnstileToken("")}
        options={{
          theme: "auto",
        }}
      />

      <button
        type="submit"
        disabled={registerMutation.isPending || !turnstileToken}
        className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
      >
        {registerMutation.isPending ? (
          <>
            <Loader className="w-5 h-5 animate-spin" /> Đang tạo tài khoản...
          </>
        ) : (
          "Tạo tài khoản"
        )}
      </button>
    </form>
  );
}
