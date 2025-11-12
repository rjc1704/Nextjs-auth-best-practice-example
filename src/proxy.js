import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired, refreshAccessToken } from "./lib/utils/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // 1. 보호된 경로 정의
  const protectedPaths = ["/profile", "/blogs/create", "/blogs/edit"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );

  // 2. 인증 페이지 정의 (로그인, 회원가입)
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 3. 보호된 경로 체크
  if (isProtectedPath) {
    // accessToken이 유효하면 통과
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.next();
    }

    // accessToken 만료 + refreshToken 있으면 갱신 시도
    if (refreshToken && !isTokenExpired(refreshToken)) {
      const newAccessToken = await refreshAccessToken(refreshToken);

      if (newAccessToken) {
        // 토큰 갱신 성공 - 새 토큰으로 쿠키 업데이트
        const decoded = jwtDecode(newAccessToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        const response = NextResponse.next();
        response.cookies.set("accessToken", newAccessToken, {
          path: "/",
          maxAge: expiresIn,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        });

        return response;
      }
    }

    // 토큰 없거나 갱신 실패 - 로그인 페이지로 리다이렉트
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. 인증 페이지 체크 (이미 로그인된 사용자는 /blogs로)
  if (isAuthPath) {
    // accessToken이 유효하면 블로그 페이지로 리다이렉트
    console.log("accessToken::", accessToken);
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.redirect(new URL("/blogs", request.url));
    }

    // accessToken 없지만 refreshToken으로 갱신 가능하면
    if (refreshToken && !isTokenExpired(refreshToken)) {
      const newAccessToken = await refreshAccessToken(refreshToken);

      if (newAccessToken) {
        // 토큰 갱신 성공 - 블로그 페이지로 리다이렉트
        const decoded = jwtDecode(newAccessToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        const response = NextResponse.redirect(new URL("/blogs", request.url));
        response.cookies.set("accessToken", newAccessToken, {
          path: "/",
          maxAge: expiresIn,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        });

        return response;
      }
    }

    // 인증되지 않은 사용자는 로그인/회원가입 페이지 접근 허용
    return NextResponse.next();
  }

  // 5. 그 외 모든 경로는 통과
  return NextResponse.next();
}

export const config = {
  matcher: [
    // 보호된 경로
    "/profile/:path*",
    "/blogs/create",
    "/blogs/:id/edit",
    // 인증 경로
    "/login",
    "/signup",
  ],
};
