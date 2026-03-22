import React, { useState, useEffect, useCallback } from "react";
import ClientHeader from "./ClientHeader";
import FooterClient from "./FooterClient";
import { useClientAuth } from "../../../contexts/ClientAuthContext";
import { CartProvider, useCart } from "../../../contexts/CartContext";
import { getUnreadCount } from "../../../services/client/clientNotificationService";
import "../../../styles/client/client-layout.css";

const POLL_INTERVAL = 60000;

const LayoutInner = ({ children }) => {
  const { isAuthenticated } = useClientAuth();
  const { cartCount } = useCart();
  const [notifCount, setNotifCount] = useState(0);

  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifCount(0);
      return;
    }
    try {
      const res = await getUnreadCount();
      setNotifCount(res?.result?.unreadCount ?? 0);
    } catch {
      /* silent */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchUnread]);

  return (
    <div className="client-layout">
      <ClientHeader
        cartCount={cartCount}
        notifCount={notifCount}
        onNotifRead={fetchUnread}
      />
      <main className="client-main">{children}</main>
      <FooterClient />
    </div>
  );
};

/* ── Bọc CartProvider bên ngoài ── */
const ClientLayout = ({ children }) => (
  <CartProvider>
    <LayoutInner>{children}</LayoutInner>
  </CartProvider>
);

export default ClientLayout;
