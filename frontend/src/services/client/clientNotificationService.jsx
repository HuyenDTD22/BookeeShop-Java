import httpClient from "../../utils/httpClient";

/** GET /notifications?page=&size=&sortBy= */
export const getMyNotifications = async (params = {}) => {
  const res = await httpClient.get("/notifications", { params });
  return res.data;
};

/** GET /notifications/unread-count */
export const getUnreadCount = async () => {
  const res = await httpClient.get("/notifications/unread-count");
  return res.data;
};

/** GET /notifications/:id */
export const getNotificationById = async (id) => {
  const res = await httpClient.get(`/notifications/${id}`);
  return res.data;
};

/** PATCH /notifications/:id/read */
export const markAsRead = async (id) => {
  const res = await httpClient.patch(`/notifications/${id}/read`);
  return res.data;
};

/** PATCH /notifications/read-all */
export const markAllAsRead = async () => {
  const res = await httpClient.patch("/notifications/read-all");
  return res.data;
};
