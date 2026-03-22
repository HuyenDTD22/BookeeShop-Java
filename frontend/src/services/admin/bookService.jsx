import httpClient from "../../utils/httpClient";

const ADMIN_PREFIX = process.env.REACT_APP_API_PREFIX_ADMIN || "admin";
const BASE = `/${ADMIN_PREFIX}/books`;

/**
 * Lấy danh sách sách có phân trang, filter, sort
 * GET /admin/books?page=0&size=10&keyword=...&sortBy=...&sortDir=...
 */
export const getBooks = async (params = {}) => {
  const response = await httpClient.get(BASE, { params });
  return response.data;
};

/**
 * Lấy chi tiết một cuốn sách
 * GET /admin/books/:id
 */
export const getBookById = async (id) => {
  const response = await httpClient.get(`${BASE}/${id}`);
  return response.data;
};

/**
 * Tạo sách mới (multipart/form-data)
 * POST /admin/books
 * Body: { data: BookCreationRequest (JSON blob), thumbnail: File }
 */
export const createBook = async ({ data, thumbnail }) => {
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
 * Cập nhật sách (multipart/form-data)
 * PUT /admin/books/:id
 */
export const updateBook = async (id, { data, thumbnail }) => {
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
 * Xóa sách (soft delete)
 * DELETE /admin/books/:id
 */
export const deleteBook = async (id) => {
  const response = await httpClient.delete(`${BASE}/${id}`);
  return response.data;
};

/**
 * Lấy ratings của sách
 * GET /admin/ratings/books/:bookId
 */
export const getBookRatings = async (bookId) => {
  const response = await httpClient.get(
    `/${ADMIN_PREFIX}/ratings/books/${bookId}`,
  );
  return response.data;
};

/**
 * Lấy comments của sách
 * GET /admin/comments/books/:bookId
 */
export const getBookComments = async (bookId) => {
  const response = await httpClient.get(`/admin/comments/books/${bookId}`);
  return response.data;
};

/**
 * Admin trả lời comment
 * POST /admin/comments/:parentCommentId/reply
 */
export const replyComment = async (parentCommentId, { content, thumbnail }) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify({ content })], { type: "application/json" }),
  );
  if (thumbnail) form.append("thumbnail", thumbnail);

  const response = await httpClient.post(
    `/admin/comments/${parentCommentId}/reply`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};

/**
 * Admin xóa comment
 * DELETE /admin/comments/:commentId
 */
export const deleteComment = async (commentId) => {
  const response = await httpClient.delete(`/admin/comments/${commentId}`);
  return response.data;
};

/**
 * Lấy danh sách categories (dùng cho form select)
 * GET /admin/categories
 */
export const getCategories = async () => {
  const response = await httpClient.get(`/${ADMIN_PREFIX}/categories`);
  return response.data;
};
