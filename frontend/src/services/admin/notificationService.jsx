import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}/notifications`;

/**
 * GET /admin/notifications
 * Params: NotificationFilterRequest { page, size, type, status, keyword, fromDate, toDate, sortBy }
 * Returns: { result: Page<NotificationResponse> }
 */
export const getNotifications = async (params = {}) => {
  const response = await httpClient.get(BASE, { params });
  return response.data;
};

/**
 * GET /admin/notifications/:id
 * Returns: { result: NotificationResponse }
 */
export const getNotificationById = async (id) => {
  const response = await httpClient.get(`${BASE}/${id}`);
  return response.data;
};

/**
 * POST /admin/notifications
 * Body: NotificationCreationRequest {
 *   title, content, type, audienceType,
 *   targetRole?, targetUserIds?, scheduledAt?
 * }
 */
export const createNotification = async (data) => {
  const response = await httpClient.post(BASE, data);
  return response.data;
};

/**
 * DELETE /admin/notifications/:id
 * Chỉ xóa được DRAFT hoặc SCHEDULED
 */
export const deleteNotification = async (id) => {
  const response = await httpClient.delete(`${BASE}/${id}`);
  return response.data;
};

/**
 * PATCH /admin/notifications/:id/cancel
 * Hủy thông báo SCHEDULED
 */
export const cancelNotification = async (id) => {
  const response = await httpClient.patch(`${BASE}/${id}/cancel`);
  return response.data;
};

/**
 * GET /admin/notifications/:id/readers
 * Returns: { result: List<NotificationReaderResponse> }
 */
export const getNotificationReaders = async (id) => {
  const response = await httpClient.get(`${BASE}/${id}/readers`);
  return response.data;
};

/**
 * PUT /admin/notifications/:id
 * Cập nhật thông báo DRAFT hoặc SCHEDULED
 * Body: NotificationUpdateRequest
 */
export const updateNotification = async (id, data) => {
  const response = await httpClient.put(`${BASE}/${id}`, data);
  return response.data;
};
