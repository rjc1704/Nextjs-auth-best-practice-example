import { checkAndRefreshAuth } from "@/lib/actions/auth";
import { cookies } from "next/headers";
import { redirect, RedirectType } from "next/navigation";

export default async function AuthLayout({ children }) {
  // 인증 체크 & 토큰 갱신
  const isAuthenticated = await checkAndRefreshAuth();

  // 이미 인증된 사용자는 블로그로 리다이렉트
  if (isAuthenticated) {
    redirect("/blogs", RedirectType.replace);
  }

  return (
    <div className="mx-auto bg-gray-100 flex items-center justify-center min-h-[calc(100vh-7.7rem)]">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {children}
      </div>
    </div>
  );
}
