import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Lấy giá trị cookie access_token
  const token = request.cookies.get("access_token")?.value;

  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

  // Nếu người dùng chưa đăng nhập, muốn vào dashboard -> Redirect sang login
  if (!token && isDashboardPage) {
    const loginUrl = new URL("/login", request.url);
    // Lưu lại URL cuối cùng họ muốn truy cập để quay lại sau
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Nếu người dùng đã đăng nhập, muốn vào login/signup -> Redirect sang dashboard
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Cho phép request tiếp tục bình thường
  return NextResponse.next();
}

// Cấu hình matcher cho Middleware
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
