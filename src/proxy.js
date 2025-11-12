import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired, refreshAccessToken } from "./lib/utils/auth";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // matcher에서 이미 필터링되었으므로 여기 도달한 경로는 모두 체크 대상

  // 인증 페이지인지 확인
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // 인증 페이지가 아니면 = 보호된 경로
  if (!isAuthPath) {
    // accessToken이 유효하면 통과
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.next();
    }

    // accessToken 만료 + refreshToken 있으면 갱신 시도
    if (refreshToken && !isTokenExpired(refreshToken)) {
      const newAccessToken = await refreshAccessToken(refreshToken);

      if (newAccessToken) {
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

  // 인증 페이지 체크 (이미 로그인된 사용자는 /blogs로)
  if (isAuthPath) {
    if (accessToken && !isTokenExpired(accessToken)) {
      return NextResponse.redirect(new URL("/blogs", request.url));
    }

    if (refreshToken && !isTokenExpired(refreshToken)) {
      const newAccessToken = await refreshAccessToken(refreshToken);

      if (newAccessToken) {
        const decoded = jwtDecode(newAccessToken);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        const response = NextResponse.redirect(new URL("/blogs", request.url));
        response.cookies.set("accessToken", newAccessToken, {
          path: "/",
          maxAge: expiresIn,
          sameSite: "strict",
          secure: process.env.NODE_ENV === "production",
          //   httpOnly: true,
        });

        return response;
      }
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

// TODO: /blogs, blogs/[id] 경로는 보호된 경로에서 제외해보세요
export const config = {
  matcher: [
    "/profile/:path*", // /profile, /profile/*
    "/blogs/create", // /blogs/create
    "/blogs/:id/edit", // /blogs/:id/edit
    "/login", // 인증 페이지
    "/signup", // 인증 페이지
  ],
};
