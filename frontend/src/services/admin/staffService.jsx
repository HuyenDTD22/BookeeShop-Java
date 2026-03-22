import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}/users/staff`;

/**
 * GET /admin/users/staff
 * Params: { page, size, keyword, roleId, locked, sortBy, sortDir }
 * Returns: { result: Page<StaffResponse> }
 */
export const getStaffs = async (params = {}) => {
  const response = await httpClient.get(BASE, { params });
  return response.data;
};

/**
 * GET /admin/users/staff/:userId
 * Returns: { result: UserResponse }
 */
export const getStaffById = async (userId) => {
  const response = await httpClient.get(`${BASE}/${userId}`);
  return response.data;
};

/**
 * POST /admin/users/staff (multipart/form-data)
 * Body: { data: StaffCreationRequest (JSON blob), avatar?: File }
 */
export const createStaff = async ({ data, avatar }) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (avatar) form.append("avatar", avatar);

  const response = await httpClient.post(BASE, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * PUT /admin/users/staff/:userId (multipart/form-data)
 * Body: { data: StaffUpdateRequest (JSON blob), avatar?: File }
 */
export const updateStaff = async (userId, { data, avatar }) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (avatar) form.append("avatar", avatar);

  const response = await httpClient.put(`${BASE}/${userId}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * DELETE /admin/users/staff/:userId — soft delete
 */
export const deleteStaff = async (userId) => {
  const response = await httpClient.delete(`${BASE}/${userId}`);
  return response.data;
};

/**
 * PATCH /admin/users/staff/:userId/toggle-lock
 */
export const toggleLockStaff = async (userId) => {
  const response = await httpClient.patch(`${BASE}/${userId}/toggle-lock`);
  return response.data;
};

/**
 * GET /admin/roles — lấy danh sách roles để hiển thị trong form
 */
export const getRoles = async () => {
  const response = await httpClient.get(`/${ADMIN_PREFIX}/roles`);
  return response.data;
};
