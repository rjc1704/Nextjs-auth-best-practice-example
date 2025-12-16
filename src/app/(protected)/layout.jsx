import { redirect, RedirectType } from "next/navigation";
import { checkAuthWithRefresh } from "@/lib/actions/auth";

export default async function ProtectedLayout({ children }) {
  // 인증 체크 (accessToken 또는 refreshToken 중 하나라도 있으면 통과)
  const isAuthenticated = await checkAuthWithRefresh();

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
