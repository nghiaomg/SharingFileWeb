import { AuthLayout, LoginForm } from "@/features/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng nhập | FileFlow",
  description: "Đăng nhập vào hệ thống FileFlow để bắt đầu chia sẻ tệp tin.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Chào mừng trở lại! Vui lòng điền thông tin để tiếp tục."
    >
      <LoginForm />
    </AuthLayout>
  );
}
