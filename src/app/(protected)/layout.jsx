import { redirect, RedirectType } from "next/navigation";
import { cookies } from "next/headers";
import { checkAndRefreshAuth } from "@/lib/actions/auth";

export default async function ProtectedLayout({ children }) {
  // 인증 체크 & 토큰 갱신
  const isAuthenticated = await checkAndRefreshAuth();

  // 인증 실패 시 로그인 페이지로
  if (!isAuthenticated) {
    redirect("/login", RedirectType.replace);
  }

  return (
    <div className="container px-4 mt-6">
      <div className="flex flex-col h-full">{children}</div>
    </div>
  );
}
