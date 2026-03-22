import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";

const ROLES_BASE = `/${ADMIN_PREFIX}/roles`;

/** GET /admin/roles — List<RoleResponse> */
export const getRoles = async () => {
  const response = await httpClient.get(ROLES_BASE);
  return response.data;
};

/** POST /admin/roles */
export const createRole = async (data) => {
  const response = await httpClient.post(ROLES_BASE, data);
  return response.data;
};

/** PUT /admin/roles/:roleId */
export const updateRole = async (roleId, data) => {
  const response = await httpClient.put(`${ROLES_BASE}/${roleId}`, data);
  return response.data;
};

/** DELETE /admin/roles/:roleId */
export const deleteRole = async (roleId) => {
  const response = await httpClient.delete(`${ROLES_BASE}/${roleId}`);
  return response.data;
};

const PERMISSIONS_BASE = `/${ADMIN_PREFIX}/permissions`;

/** GET /admin/permissions — List<PermissionResponse> */
export const getPermissions = async () => {
  const response = await httpClient.get(PERMISSIONS_BASE);
  return response.data;
};

/**
 * PUT /admin/permissions/roles/:roleId
 * Gán (replace) toàn bộ permissions cho 1 role.
 * Endpoint mới — đã chuyển từ /admin/roles/:roleId/permissions
 */
export const setRolePermissions = async (roleId, permissionIds) => {
  const response = await httpClient.put(`${PERMISSIONS_BASE}/roles/${roleId}`, {
    permissionIds,
  });
  return response.data;
};
