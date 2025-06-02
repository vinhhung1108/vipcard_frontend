import { NextRequest, NextResponse } from "next/server";

// Middleware chạy cho các route bắt đầu bằng /dashboard
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Chỉ áp dụng middleware cho các route trong /dashboard
  if (pathname.startsWith("/dashboard")) {
    // Lấy token từ cookie
    const token = request.cookies.get("token")?.value;

    // Nếu không có token, chuyển hướng đến /login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Nếu có token, tiếp tục cho phép truy cập
    return NextResponse.next();
  }

  // Các route khác không cần kiểm tra
  return NextResponse.next();
}

// Cấu hình matcher để áp dụng middleware cho các route trong /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
};
