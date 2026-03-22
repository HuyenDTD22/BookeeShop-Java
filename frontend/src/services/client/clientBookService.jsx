import httpClient from "../../utils/httpClient";

const BASE = "/books";

// ─────────────────────────────────────────────────────────────────
// Book APIs
// ─────────────────────────────────────────────────────────────────

export const searchBooks = async (keyword, size = 10) => {
  const response = await httpClient.get(`${BASE}/search`, {
    params: { keyword, size },
  });
  return response.data?.result ?? [];
};

export const getAllBooks = async (params = {}) => {
  const response = await httpClient.get(BASE, { params });
  return response.data;
};

export const getFeaturedBooks = async (params = {}) => {
  const response = await httpClient.get(`${BASE}/featured`, { params });
  return response.data;
};

export const getNewestBooks = async (params = {}) => {
  const response = await httpClient.get(`${BASE}/newest`, { params });
  return response.data;
};

export const getBooksByCategory = async (categoryId, params = {}) => {
  const response = await httpClient.get(`${BASE}/category/${categoryId}`, {
    params,
  });
  return response.data;
};

export const getBookById = async (bookId) => {
  const response = await httpClient.get(`${BASE}/${bookId}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await httpClient.get("/categories");
  return response.data;
};

// ─────────────────────────────────────────────────────────────────
// Rating APIs  →  /ratings
// ─────────────────────────────────────────────────────────────────

/**
 * GET /ratings/books/:bookId
 * Returns: { result: BookRatingSummaryResponse }
 * { averageRating, totalRatings, oneStar, twoStar, threeStar, fourStar, fiveStar, ratings[] }
 */
export const getRatingsByBookId = async (bookId) => {
  const response = await httpClient.get(`/ratings/books/${bookId}`);
  return response.data;
};

/**
 * POST /ratings
 * Body: { bookId, value }
 * Yêu cầu: đã mua và nhận sách (order COMPLETED)
 */
export const createRating = async (bookId, value) => {
  const response = await httpClient.post("/ratings", { bookId, value });
  return response.data;
};

/**
 * PATCH /ratings/:ratingId
 * Body: { value }
 */
export const updateRating = async (ratingId, value) => {
  const response = await httpClient.patch(`/ratings/${ratingId}`, { value });
  return response.data;
};

/**
 * DELETE /ratings/:ratingId
 */
export const deleteRating = async (ratingId) => {
  const response = await httpClient.delete(`/ratings/${ratingId}`);
  return response.data;
};

// ─────────────────────────────────────────────────────────────────
// Comment APIs  →  /comments
// ─────────────────────────────────────────────────────────────────

/**
 * GET /comments/books/:bookId
 * Returns: { result: BookCommentResponse }
 * { totalComments, comments: CommentResponse[] (nested tree) }
 */
export const getCommentsByBookId = async (bookId) => {
  const response = await httpClient.get(`/comments/books/${bookId}`);
  return response.data;
};

/**
 * POST /comments  (multipart/form-data)
 * Body: { data: { bookId, content, parentId? }, thumbnail?: File }
 * Yêu cầu: đã mua và nhận sách (order COMPLETED)
 */
export const createComment = async (
  bookId,
  content,
  parentId = null,
  thumbnail = null,
) => {
  const form = new FormData();
  const data = { bookId, content, ...(parentId && { parentId }) };
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (thumbnail) form.append("thumbnail", thumbnail);

  const response = await httpClient.post("/comments", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * DELETE /comments/:commentId
 */
export const deleteComment = async (commentId) => {
  const response = await httpClient.delete(`/comments/${commentId}`);
  return response.data;
};
