// API endpoints
export const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";
export const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    INTROSPECT: "/auth/introspect",
    REFRESH: "/auth/refresh",
  },
  ADMIN: {
    DASHBOARD_SUMMARY: `/${ADMIN_PREFIX}/dashboards/summary`,
    DASHBOARD_ANALYTICS: `/${ADMIN_PREFIX}/dashboards/analytics`,
    USERS: `/${ADMIN_PREFIX}/users`,
  },
};

// JWT
export const TOKEN_KEY = "bookee_access_token";
export const REFRESH_KEY = "bookee_refresh_token";

// Roles
export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: { label: "Chờ xác nhận", color: "warning" },
  CONFIRMED: { label: "Đã xác nhận", color: "info" },
  SHIPPING: { label: "Đang giao", color: "info" },
  COMPLETED: { label: "Hoàn thành", color: "success" },
  CANCELLED: { label: "Đã hủy", color: "danger" },
};

export const ITEMS_PER_PAGE = 10;
