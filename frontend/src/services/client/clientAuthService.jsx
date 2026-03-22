import httpClient from "../../utils/httpClient";
import { TOKEN_KEY, REFRESH_KEY } from "../../constants";
import { decodeJwt, extractRolesFromScope } from "../../utils/format";

/** POST /users/register */
export const register = async (data) => {
  const res = await httpClient.post("/users/register", data);
  return res.data;
};

/** POST /auth/login */
export const login = async (username, password) => {
  const res = await httpClient.post("/auth/login", { username, password });
  const data = res.data;
  if (data?.result?.token) {
    const token = data.result.token;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_KEY, token);
  }
  return data;
};

/** POST /auth/refresh → lấy token mới */
export const refreshToken = async () => {
  const token = localStorage.getItem(REFRESH_KEY);
  if (!token) throw new Error("No refresh token");

  // Dùng axios trực tiếp để tránh interceptor loop
  const { default: axios } = await import("axios");
  const res = await axios.post(
    `${process.env.REACT_APP_API_URL}/auth/refresh`,
    { token },
  );

  const newToken = res.data?.result?.token;
  if (!newToken) throw new Error("Refresh failed");

  localStorage.setItem(TOKEN_KEY, newToken);
  localStorage.setItem(REFRESH_KEY, newToken);
  return newToken;
};

/** POST /auth/logout */
export const logout = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  try {
    if (token) await httpClient.post("/auth/logout", { token });
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};

/** POST /auth/forgot-password */
export const sendOtp = async (username) => {
  const res = await httpClient.post("/auth/forgot-password", { username });
  return res.data;
};

/** POST /auth/forgot-password/verify */
export const verifyOtp = async (username, otp) => {
  const res = await httpClient.post("/auth/forgot-password/verify", {
    username,
    otp,
  });
  return res.data;
};

/** POST /auth/forgot-password/reset */
export const resetPassword = async (username, otp, newPassword) => {
  const res = await httpClient.post("/auth/forgot-password/reset", {
    username,
    otp,
    newPassword,
  });
  return res.data;
};

export const getAuthInfo = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }

  const { roles, permissions } = extractRolesFromScope(payload.scope || "");
  return {
    username: payload.sub,
    roles,
    permissions,
    isAdmin: roles.includes("ADMIN"),
    isStaff: roles.some((r) => r.startsWith("STAFF_")),
    isCustomer: roles.includes("USER"),
    exp: payload.exp,
  };
};

export const isAuthenticated = () => !!getAuthInfo();
export const getToken = () => localStorage.getItem(TOKEN_KEY);
