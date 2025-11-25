"use client";

import { getServerSideToken, registerAction } from "@/lib/actions/auth";
import { authService } from "@/lib/service/authService";
import { userService } from "@/lib/service/userService";
import { setTokensToCookie } from "@/lib/utils/auth";
import { useRouter } from "next/navigation";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  login: () => {},
  logout: () => {},
  user: null,
  updateUser: () => {},
  register: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();

  const getUser = async () => {
    try {
      const userData = await userService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("사용자 정보를 가져오는데 실패했습니다:", error);
      setUser(null);
    }
  };

  const register = async (nickname, email, password, passwordConfirmation) => {
    // 회원가입 성공 시 유저데이터를 API 에서 응답해주는 경우, 즉시 로그인 처리 가능
    const { userData, success } = await registerAction(
      nickname,
      email,
      password,
      passwordConfirmation,
    );

    if (!success) {
      throw new Error("회원가입 실패");
    }
    setUser(userData);
  };

  const login = async (email, password) => {
    // 로그인 성공 시 유저데이터를 API 에서 응답해주는 경우, 유저 상태 변경
    const userData = await authService.login(email, password);
    // 토큰 저장 로직 추가
    if (userData.accessToken && userData.refreshToken) {
      console.log("userData in login", userData);
      setTokensToCookie(userData.accessToken, userData.refreshToken);
    }

    setUser(userData.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  useEffect(() => {
    // 웹페이지 랜딩 또는 새로고침 시 마다 서버에서 유저 데이터 동기화
    async function fetchUser() {
      const token = await getServerSideToken();
      console.log("token::", token);
      if (token) {
        getUser();
      } else {
        setUser(null);
      }
    }
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
