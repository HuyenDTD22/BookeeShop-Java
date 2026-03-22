import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}`;

/** GET /admin/me */
export const getMyProfile = async () => {
  const res = await httpClient.get(`${BASE}/users/me`);
  return res.data;
};

/**
 * PUT /admin/me (multipart/form-data)
 * data: CustomerUpdateRequest (JSON blob), avatar?: File
 */
export const updateMyProfile = async ({ data, avatar }) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (avatar) form.append("avatar", avatar);
  const res = await httpClient.put(`${BASE}/users/me`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/** GET /admin/me/notifications */
export const getMyNotifications = async (params = {}) => {
  const res = await httpClient.get(`${BASE}/notifications/me`, { params });
  return res.data;
};

/** GET /admin/me/notifications/:id */
export const getMyNotificationById = async (id) => {
  const res = await httpClient.get(`${BASE}/notifications/me/${id}`);
  return res.data;
};

/** PATCH /admin/me/notifications/:id/read */
export const markNotificationAsRead = async (id) => {
  const res = await httpClient.patch(`${BASE}/notifications/me/${id}/read`);
  return res.data;
};

/** PATCH /admin/me/notifications/read-all */
export const markAllNotificationsAsRead = async () => {
  const res = await httpClient.patch(`${BASE}/notifications/me/read-all`);
  return res.data;
};

/** GET /admin/me/notifications/unread-count */
export const getUnreadCount = async () => {
  const res = await httpClient.get(`${BASE}/notifications/me/unread-count`);
  return res.data;
};
