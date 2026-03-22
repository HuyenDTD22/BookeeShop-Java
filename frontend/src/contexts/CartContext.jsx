import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { getMyCart } from "../services/client/cartService";
import { useClientAuth } from "./ClientAuthContext";

const CartContext = createContext({
  cartCount: 0,
  cartItems: [],
  refreshCart: async () => {},
});

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useClientAuth();
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      setCartItems([]);
      return;
    }
    try {
      const res = await getMyCart();
      const items = res?.result?.items ?? [];
      setCartItems(items);
      const total = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
      setCartCount(total);
    } catch {
      setCartCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
