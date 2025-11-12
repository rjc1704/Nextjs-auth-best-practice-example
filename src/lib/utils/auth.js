import { getServerSideToken, setServerSideTokens } from "@/lib/actions/auth";
import { jwtDecode } from "jwt-decode";

/**
 * accessToken을 쿠키에 저장하는 함수
 * @param {string} accessToken - JWT 액세스 토큰
 */
export function setTokensToCookie(accessToken, refreshToken) {
  if (typeof window === "undefined") {
    return setServerSideTokens(accessToken, refreshToken);
  }

  const accessTokenData = jwtDecode(accessToken);
  const refreshTokenData = jwtDecode(refreshToken);

  const accessTokenExpiresIn =
    accessTokenData.exp - Math.floor(Date.now() / 1000);
  const refreshTokenExpiresIn =
    refreshTokenData.exp - Math.floor(Date.now() / 1000);

  document.cookie = `accessToken=${accessToken}; path=/; max-age=${accessTokenExpiresIn}; SameSite=Strict`;
  document.cookie = `refreshToken=${refreshToken}; path=/; max-age=${refreshTokenExpiresIn}; SameSite=Strict`;
}

export async function getTokenFromCookie(type = "accessToken") {
  if (typeof document === "undefined") {
    return getServerSideToken(type);
  }

  const cookies = document.cookie.split(";");
  const tokenCookie = cookies.find((cookie) =>
    cookie.trim().startsWith(`${type}=`),
  );
  return tokenCookie ? tokenCookie.trim().split("=")[1] : null;
}

/**
 * 사용자가 인증되었는지 확인하는 함수
 * @returns {boolean} 인증 여부
 */
export function isAuthenticated() {
  return !!getTokenFromCookie();
}

/**
 * 토큰이 만료되었는지 확인
 */
export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch {
    return true;
  }
}

/**
 * 토큰 갱신 함수
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${baseURL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.accessToken;
    }
    return null;
  } catch (error) {
    console.error("토큰 갱신 실패:", error);
    return null;
  }
}
