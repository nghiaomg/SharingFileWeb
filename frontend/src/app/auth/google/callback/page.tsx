"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginWithGoogle } from "@/features/auth/api";
import { Loader } from "lucide-react";

const processedCodes = new Set<string>();

function GoogleCallbackComponent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get("code");

    useEffect(() => {
        if (code && !processedCodes.has(code)) {
            processedCodes.add(code);
            const redirectUri = typeof window !== "undefined"
                ? window.location.origin + window.location.pathname
                : process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL || "https://sharingfile.nghiaomg.xyz/auth/google/callback";
            loginWithGoogle(code, redirectUri)
                .then(() => {
                    toast.success("Đăng nhập Google thành công!");
                    router.push("/dashboard");
                })
                .catch((err) => {
                    console.error("Google login error:", err);
                    toast.error("Đăng nhập Google thất bại.");
                    router.push("/login"); // Fallback
                });
        } else if (!code) {
            router.push("/login");
        }
    }, [code, router]);

    return null;
}

export default function GoogleAuthCallback() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader className="w-12 h-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground font-medium">
                Đang xác thực Google...
            </p>
            <Suspense fallback={null}>
                <GoogleCallbackComponent />
            </Suspense>
        </div>
    );
}
