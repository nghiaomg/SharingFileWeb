"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { loginWithDribbble } from "@/features/auth/api";
import { Loader } from "lucide-react";

function DribbbleCallbackComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const isProcessing = useRef(false);

  useEffect(() => {
    if (code && !isProcessing.current) {
      isProcessing.current = true;
      loginWithDribbble(code)
        .then(() => {
          toast.success("Đăng nhập Dribbble thành công!");
          router.push("/dashboard");
        })
        .catch((err) => {
          console.error("Dribbble login error:", err);
          toast.error("Đăng nhập Dribbble thất bại.");
          router.push("/login"); // Fallback
        });
    } else if (!code && !isProcessing.current) {
      router.push("/login");
    }
  }, [code, router]);

  return null;
}

export default function DribbbleAuthCallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader className="w-12 h-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground font-medium">
        Đang xác thực Dribbble...
      </p>
      <Suspense fallback={null}>
        <DribbbleCallbackComponent />
      </Suspense>
    </div>
  );
}
