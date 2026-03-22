import httpClient from "../../utils/httpClient";

const BASE = "/carts";

/**
 * GET /carts
 * Returns: { result: CartResponse }
 * CartResponse: { cartId, items: CartItemResponse[], totalItems }
 * CartItemResponse: { cartItemId, quantity, book: BookInCartResponse }
 * BookInCartResponse: { id, title, thumbnail, price, discountPercentage }
 */
export const getMyCart = async () => {
  const response = await httpClient.get(BASE);
  return response.data;
};

/**
 * POST /carts/items
 * Body: { bookId, quantity }
 */
export const addToCart = async (bookId, quantity) => {
  const response = await httpClient.post(`${BASE}/items`, { bookId, quantity });
  return response.data;
};

/**
 * PATCH /carts/items/:cartItemId
 * Body: { quantity }
 */
export const updateCartItem = async (cartItemId, quantity) => {
  const response = await httpClient.patch(`${BASE}/items/${cartItemId}`, {
    quantity,
  });
  return response.data;
};

/**
 * DELETE /carts/items/:cartItemId
 */
export const removeCartItem = async (cartItemId) => {
  const response = await httpClient.delete(`${BASE}/items/${cartItemId}`);
  return response.data;
};

/* Tính finalPrice từ price + discountPercentage */
export const calcFinalPrice = (price, discountPercentage) => {
  if (!price) return 0;
  if (!discountPercentage || discountPercentage <= 0) return price;
  return Math.round(price * (1 - discountPercentage / 100) * 100) / 100;
};
