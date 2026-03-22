import httpClient from "../../utils/httpClient";
import { API_ENDPOINTS, TOKEN_KEY, REFRESH_KEY } from "../../constants";
import { decodeJwt, extractRolesFromScope } from "../../utils/format";

const authService = {
  login: async (username, password) => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      username,
      password,
    });
    const data = response.data;
    if (data?.result?.token) {
      const token = data.result.token;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_KEY, token);
    }
    return data;
  },

  logout: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    try {
      if (token) {
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, { token });
      }
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  },

  introspect: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return { result: { valid: false } };
    const response = await httpClient.post(API_ENDPOINTS.AUTH.INTROSPECT, {
      token,
    });
    return response.data;
  },

  getAuthInfo: () => {
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
      isStaff: roles.length > 0,
      exp: payload.exp,
      iat: payload.iat,
    };
  },

  isAuthenticated: () => !!authService.getAuthInfo(),
  isAdminOrStaff: () => {
    const info = authService.getAuthInfo();
    return info ? info.isAdmin || info.isStaff : false;
  },
  getToken: () => localStorage.getItem(TOKEN_KEY),
};

export default authService;
