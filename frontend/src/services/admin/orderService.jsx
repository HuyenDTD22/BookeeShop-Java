import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}/orders`;

/**
 * GET /admin/orders
 * Params: OrderFilterRequest { page, size, status, paymentMethod, paymentStatus, keyword, fromDate, toDate, sortBy }
 * Returns: { result: Page<OrderResponse> }
 */
export const getOrders = async (params = {}) => {
  const response = await httpClient.get(BASE, { params });
  return response.data;
};

/**
 * GET /admin/orders/:orderId
 * Returns: { result: OrderResponse }
 */
export const getOrderById = async (orderId) => {
  const response = await httpClient.get(`${BASE}/${orderId}`);
  return response.data;
};

/**
 * PATCH /admin/orders/:orderId/status
 * Body: { status: OrderStatus }
 * Cập nhật trạng thái đơn hàng (PENDING→CONFIRMED→SHIPPING→COMPLETED | CANCELLED)
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await httpClient.patch(`${BASE}/${orderId}/status`, {
    status,
  });
  return response.data;
};

/**
 * PATCH /admin/orders/bulk-status
 * Body: { orderIds: UUID[], status: OrderStatus }
 * Cập nhật trạng thái nhiều đơn hàng cùng lúc
 */
export const bulkUpdateOrderStatus = async (orderIds, status) => {
  const response = await httpClient.patch(`${BASE}/bulk-status`, {
    orderIds,
    status,
  });
  return response.data;
};

/**
 * PUT /admin/orders/:orderId
 * Body: OrderUpdateRequest { fullName?, phone?, address?, paymentMethod?, paymentStatus?, status? }
 * Chỉnh sửa thông tin đơn hàng
 */
export const updateOrder = async (orderId, data) => {
  const response = await httpClient.put(`${BASE}/${orderId}`, data);
  return response.data;
};

/**
 * DELETE /admin/orders/:orderId
 * Soft delete — chỉ được xóa khi PENDING hoặc CANCELLED
 */
export const deleteOrder = async (orderId) => {
  const response = await httpClient.delete(`${BASE}/${orderId}`);
  return response.data;
};
