import { NextResponse } from "next/server";

export function middleware(request) {
  // 현재 URL 경로 가져오기
  const { pathname } = request.nextUrl;

  // 쿠키에서 인증 토큰 확인
  const authToken = request.cookies.get("accessToken")?.value;
  const isAuthenticated = !!authToken;

  // 인증 관련 경로 (로그인, 회원가입)
  const authPaths = ["/login", "/signup"];
  const isAuthRoute = authPaths.includes(pathname);

  // 로그인한 사용자가 인증 페이지에 접근하는 경우 블로그 목록으로 리다이렉트
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/blogs", request.url));
  }

  // 그 외의 경우는 정상적으로 진행
  // 보호된 경로는 (protected)/layout.jsx에서 처리
  return NextResponse.next();
}

// 미들웨어가 적용될 경로 패턴 지정
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
