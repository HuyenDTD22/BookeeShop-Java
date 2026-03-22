import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}/users`;

/**
 * GET /admin/users/customer
 * Params: { page, size, keyword, locked, sortBy, sortDir }
 * Returns: { result: Page<CustomerResponse> }
 */
export const getCustomers = async (params = {}) => {
  const response = await httpClient.get(`${BASE}/customer`, { params });
  return response.data;
};

/**
 * GET /admin/users/customer/:userId
 * Returns: { result: UserResponse }
 */
export const getCustomerById = async (userId) => {
  const response = await httpClient.get(`${BASE}/customer/${userId}`);
  return response.data;
};

/**
 * PATCH /admin/users/customer/:userId/toggle-lock
 * Khóa / Mở khóa tài khoản khách hàng
 */
export const toggleLockCustomer = async (userId) => {
  const response = await httpClient.patch(
    `${BASE}/customer/${userId}/toggle-lock`,
  );
  return response.data;
};

/**
 * DELETE /admin/users/customer/:userId
 * Soft delete khách hàng
 */
export const deleteCustomer = async (userId) => {
  const response = await httpClient.delete(`${BASE}/customer/${userId}`);
  return response.data;
};
