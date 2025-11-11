import { redirect, RedirectType } from "next/navigation";
import { cookies } from "next/headers";

export default async function ProtectedLayout({ children }) {
  // 쿠키에서 인증 토큰 확인
  const cookieStore = await cookies();
  const authToken = cookieStore.get("accessToken")?.value;

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!authToken) {
    redirect("/login", "replace");
  }

  return (
    <div className="container px-4 mt-6">
      <div className="flex flex-col h-full">{children}</div>
    </div>
  );
}
