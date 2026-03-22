import axios from "axios";
import { API_ENDPOINTS, TOKEN_KEY, REFRESH_KEY } from "../constants";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const httpClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/* ── Request interceptor: đính kèm token vào mọi request ── */
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

/**
 * Redirect về trang đăng nhập phù hợp khi không thể refresh token.
 * - Admin path  → /admin/auth/login (hoặc /${ADMIN}/auth/login)
 * - Client path → /auth/login
 */
const redirectToLogin = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);

  const isAdminPath = window.location.pathname.startsWith(`/${ADMIN}`);
  if (isAdminPath) {
    window.location.href = `/${ADMIN}/auth/login`;
  } else {
    window.location.href = "/auth/login";
  }
};

/**
 * Các endpoint public auth: trả lỗi thẳng, không refresh không redirect.
 * Vì 401 ở đây nghĩa là sai credentials chứ không phải hết hạn token.
 */
const isPublicAuthUrl = (url = "") =>
  url.includes("/auth/login") ||
  url.includes("/users/register") ||
  url.includes("/auth/forgot-password") ||
  url.includes("/auth/introspect") ||
  url.includes("/auth/refresh"); // tránh loop khi refresh cũng 401

/* ── Response interceptor: tự động refresh token khi 401 ── */
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Public endpoints → trả lỗi thẳng, không xử lý
    if (status === 401 && isPublicAuthUrl(originalRequest?.url || "")) {
      return Promise.reject(error);
    }

    // 401 trên request đã cần auth → thử refresh
    if (status === 401 && !originalRequest._retry) {
      // Nếu đang refresh, xếp hàng chờ
      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject }),
        )
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshTokenValue = localStorage.getItem(REFRESH_KEY);

      if (!refreshTokenValue) {
        // Không có refresh token → redirect ngay
        isRefreshing = false;
        redirectToLogin();
        return Promise.reject(error);
      }

      try {
        // Gọi POST /auth/refresh với axios thuần để tránh interceptor loop
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/refresh`,
          { token: refreshTokenValue },
        );

        const newToken = res.data?.result?.token;

        if (!newToken) throw new Error("Empty token from refresh");

        // Lưu token mới
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(REFRESH_KEY, newToken);
        httpClient.defaults.headers["Authorization"] = `Bearer ${newToken}`;

        // Giải phóng queue
        processQueue(null, newToken);

        // Retry request gốc với token mới
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại → xóa token + redirect về login
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default httpClient;
