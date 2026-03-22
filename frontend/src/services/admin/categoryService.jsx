import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}/categories`;

/**
 * GET /admin/categories
 * Returns: { result: List<CategoryTreeResponse> }
 * CategoryTreeResponse: { id, name, thumbnail, description, children[] }
 */
export const getAllCategories = async () => {
  const response = await httpClient.get(BASE);
  return response.data;
};

/**
 * GET /admin/categories/:id
 * Returns: { result: CategoryResponse }
 * CategoryResponse: { id, name, thumbnail, description, parentId, parentName }
 */
export const getCategoryById = async (id) => {
  const response = await httpClient.get(`${BASE}/${id}`);
  return response.data;
};

/**
 * POST /admin/categories (multipart/form-data)
 * Body: { data: CategoryCreationRequest (JSON blob), thumbnail: File }
 */
export const createCategory = async ({ data, thumbnail }) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (thumbnail) form.append("thumbnail", thumbnail);
  const response = await httpClient.post(BASE, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * PUT /admin/categories/:id (multipart/form-data)
 * Body: { data: CategoryUpdateRequest (JSON blob), thumbnail?: File }
 */
export const updateCategory = async (id, { data, thumbnail }) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (thumbnail) form.append("thumbnail", thumbnail);
  const response = await httpClient.put(`${BASE}/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * DELETE /admin/categories/:id — soft delete
 * Lỗi nếu còn danh mục con hoặc sách
 */
export const deleteCategory = async (id) => {
  const response = await httpClient.delete(`${BASE}/${id}`);
  return response.data;
};
