/* ── Order status helpers ── */
export const ORDER_STATUS_LABEL = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_ICON = {
  PENDING: "🕐",
  CONFIRMED: "✅",
  SHIPPING: "🚚",
  COMPLETED: "🎉",
  CANCELLED: "❌",
};

/* Quy tắc chuyển trạng thái hợp lệ (mirror backend) */
export const NEXT_VALID_STATUSES = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export const PAYMENT_STATUS_LABEL = {
  PENDING: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

export const PAYMENT_METHOD_LABEL = {
  COD: "COD",
  VNPAY: "VNPay",
};

/* Màu sắc badge */
export const ORDER_STATUS_CLASS = {
  PENDING: "order-status-PENDING",
  CONFIRMED: "order-status-CONFIRMED",
  SHIPPING: "order-status-SHIPPING",
  COMPLETED: "order-status-COMPLETED",
  CANCELLED: "order-status-CANCELLED",
};

export const PAYMENT_STATUS_CLASS = {
  PENDING: "payment-PENDING",
  PAID: "payment-PAID",
  FAILED: "payment-FAILED",
  REFUNDED: "payment-REFUNDED",
};

/* Timeline steps (không tính CANCELLED) */
export const STATUS_TIMELINE = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "COMPLETED",
];
