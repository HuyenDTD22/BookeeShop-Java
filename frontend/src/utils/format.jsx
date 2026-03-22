export const formatCurrency = (value) => {
  if (value == null) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date, options = {}) => {
  if (!date) return "—";
  const defaultOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  };
  return new Intl.DateTimeFormat("vi-VN", defaultOptions).format(
    new Date(date),
  );
};

export const formatPercent = (value) => {
  if (value == null) return "0%";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

export const formatCompact = (value) => {
  if (value == null) return "0";
  return new Intl.NumberFormat("vi-VN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
};

export const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const extractRolesFromScope = (scope = "") => {
  const parts = scope.split(" ").filter(Boolean);
  const roles = parts
    .filter((p) => p.startsWith("ROLE_"))
    .map((p) => p.replace("ROLE_", ""));
  const permissions = parts.filter((p) => !p.startsWith("ROLE_"));
  return { roles, permissions };
};
