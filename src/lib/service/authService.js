import { defaultFetch, tokenFetch } from "@/lib/fetchClient";
import { clearServerSideTokens } from "../actions/auth";

export const authService = {
  // 쿠키 인증을 사용하는 로그인
  login: (email, password) =>
    defaultFetch("/auth/signIn", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    }),

  // 회원가입
  register: (nickname, email, password, passwordConfirmation) =>
    defaultFetch("/auth/signUp", {
      method: "POST",
      body: JSON.stringify({ nickname, email, password, passwordConfirmation }),
      cache: "no-store",
    }),

  // 로그아웃
  logout: () => clearServerSideTokens(),
};
