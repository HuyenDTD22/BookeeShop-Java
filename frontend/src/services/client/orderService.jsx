import httpClient from "../../utils/httpClient";

// ─────────────────────────────────────────────────────────────────
// User profile
// ─────────────────────────────────────────────────────────────────

/** GET /users/me → UserResponse { fullName, phone, address, ... } */
export const getMyProfile = async () => {
  const res = await httpClient.get("/users/me");
  return res.data;
};

// ─────────────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────────────

/**
 * POST /orders
 * Body: OrderCreationRequest
 *   { fullName, phone, address, note, paymentMethod,
 *     bookId?, quantity?,          ← mua ngay
 *     cartItemIds? }               ← mua từ giỏ
 *
 * Returns:
 *   - COD   → result = orderId (UUID string)
 *   - VNPAY → result = VNPay payment URL (string)
 */
export const createOrder = async (payload, httpReq) => {
  const res = await httpClient.post("/orders", payload);
  return res.data;
};

/** GET /orders → List<OrderResponse> */
export const getMyOrders = async () => {
  const res = await httpClient.get("/orders");
  return res.data;
};

/** GET /orders/:orderId → OrderResponse */
export const getMyOrderById = async (orderId) => {
  const res = await httpClient.get(`/orders/${orderId}`);
  return res.data;
};

/** PATCH /orders/:orderId/cancel → OrderResponse */
export const cancelMyOrder = async (orderId) => {
  const res = await httpClient.patch(`/orders/${orderId}/cancel`);
  return res.data;
};
