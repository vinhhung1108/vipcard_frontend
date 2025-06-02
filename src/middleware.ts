import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function middleware(request: NextRequest) {
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

    try {
      // Gọi API để kiểm tra token
      await axios.get("https://apicard.namident.com/auth/verify-token", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Token hợp lệ, tiếp tục cho phép truy cập
      return NextResponse.next();
    } catch (error) {
      // Nếu token không hợp lệ (hết hạn hoặc lỗi), xóa cookie và chuyển hướng
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("token", "", { maxAge: -1 }); // Xóa cookie
      return response;
    }
  }

  // Các route khác không cần kiểm tra
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
