"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginWithGithub } from "@/features/auth/api";
import { Loader } from "lucide-react";

const processedCodes = new Set<string>();

function GithubCallbackComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  useEffect(() => {
    if (code && !processedCodes.has(code)) {
      processedCodes.add(code);
      const redirectUri = typeof window !== "undefined"
        ? window.location.origin + window.location.pathname
        : process.env.NEXT_PUBLIC_GITHUB_CALLBACK_URL || "https://sharingfile.nghiaomg.xyz/auth/github/callback";
      loginWithGithub(code, redirectUri)
        .then(() => {
          toast.success("Đăng nhập GitHub thành công!");
          router.push("/dashboard");
        })
        .catch((err) => {
          console.error("Github login error:", err);
          toast.error("Đăng nhập GitHub thất bại.");
          router.push("/login"); // Fallback
        });
    } else if (!code) {
      router.push("/login");
    }
  }, [code, router]);

  return null;
}

export default function GithubAuthCallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-12 h-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground font-medium">
        Đang xác thực GitHub...
      </p>
      <Suspense fallback={null}>
        <GithubCallbackComponent />
      </Suspense>
    </div>
  );
}
