import { AuthLayout, SignupForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Đăng ký | FileFlow",
    description: "Tạo tài khoản mới để trải nghiệm FileFlow lưu trữ miễn phí.",
};

export default function SignupPage() {
    return (
        <AuthLayout
            title="Đăng ký tài khoản"
            subtitle="Tạo tài khoản miễn phí để nhận ngay 1GB lưu trữ đầu tiên của bạn."
        >
            <SignupForm />
        </AuthLayout>
    );
}
