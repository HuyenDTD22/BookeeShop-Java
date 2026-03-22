import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiBell,
  FiCheck,
  FiCheckSquare,
} from "react-icons/fi";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from "../../../services/admin/profileService";
import { formatDate } from "../../../utils/format";
import "../../../styles/admin/layout.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const HeaderComponent = ({ sidebarWidth = 260 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef(null);

  const [bellOpen, setBellOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellLoading, setBellLoading] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target))
        setUserOpen(false);
      if (bellRef.current && !bellRef.current.contains(e.target))
        setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchUnread = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res?.result?.unreadCount ?? 0);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    fetchUnread();
    const t = setInterval(fetchUnread, 60_000);
    return () => clearInterval(t);
  }, [fetchUnread]);

  const handleBellOpen = async () => {
    setBellOpen((o) => !o);
    if (!bellOpen) {
      try {
        setBellLoading(true);
        const res = await getMyNotifications({
          page: 0,
          size: 8,
          sortBy: "newest",
        });
        setNotifs(res?.result?.content ?? []);
      } catch {
        /* silent */
      } finally {
        setBellLoading(false);
      }
    }
  };

  const handleNotifClick = async (notif) => {
    setBellOpen(false);
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifs((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
      } catch {
        /* silent */
      }
    }
    navigate(`/${ADMIN}/my-notifications/${notif.id}`);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      /* silent */
    }
  };

  const displayName = user?.username || "Admin";
  const roleLabel =
    user?.roles?.[0] === "ADMIN" ? "Quản trị viên" : "Nhân viên";
  const avatarLetter = displayName[0]?.toUpperCase();

  return (
    <header
      className="header"
      style={{
        left: sidebarWidth,
        background: "var(--sidebar-bg)",
        borderBottom: "1px solid var(--sidebar-border)",
        boxShadow: "none",
      }}
    >
      {/* ── Bell ── */}
      <div ref={bellRef} style={{ position: "relative" }}>
        <button
          onClick={handleBellOpen}
          aria-label="Thông báo"
          style={{
            position: "relative",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--sidebar-text)",
            padding: "6px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            transition: "background var(--transition)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "var(--sidebar-hover)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <FiBell size={19} />
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                background: "var(--danger)",
                color: "#fff",
                borderRadius: "99px",
                fontSize: "0.6rem",
                fontWeight: 700,
                minWidth: 16,
                height: 16,
                lineHeight: "16px",
                textAlign: "center",
                padding: "0 4px",
                border: "2px solid var(--sidebar-bg)",
              }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {bellOpen && (
          <div
            className="animate-fadeIn"
            style={{
              position: "fixed",
              top: 72,
              right: 76,
              width: 360,
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              zIndex: 2000,
              overflow: "hidden",
            }}
          >
            {/* Bell header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px 10px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                }}
              >
                Thông báo
                {unreadCount > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      color: "var(--accent)",
                      fontSize: "0.8rem",
                    }}
                  >
                    ({unreadCount} chưa đọc)
                  </span>
                )}
              </span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--accent)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <FiCheckSquare size={13} /> Đọc tất cả
                  </button>
                )}
                <Link
                  to={`/${ADMIN}/my-notifications`}
                  onClick={() => setBellOpen(false)}
                  style={{
                    fontSize: "0.78rem",
                    color: "var(--accent)",
                    fontWeight: 600,
                  }}
                >
                  Xem tất cả
                </Link>
              </div>
            </div>

            {/* Bell list */}
            <div style={{ maxHeight: 380, overflowY: "auto" }}>
              {bellLoading ? (
                [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    style={{ padding: "12px 16px", display: "flex", gap: 10 }}
                  >
                    <div
                      className="skeleton"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        marginTop: 4,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div
                        className="skeleton"
                        style={{ height: 12, borderRadius: 4, marginBottom: 6 }}
                      />
                      <div
                        className="skeleton"
                        style={{ height: 10, width: "60%", borderRadius: 4 }}
                      />
                    </div>
                  </div>
                ))
              ) : notifs.length === 0 ? (
                <div
                  style={{
                    padding: "32px 16px",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  <FiBell
                    size={28}
                    style={{
                      opacity: 0.25,
                      display: "block",
                      margin: "0 auto 10px",
                    }}
                  />
                  Chưa có thông báo nào
                </div>
              ) : (
                notifs.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotifClick(notif)}
                    style={{
                      display: "flex",
                      gap: 10,
                      padding: "11px 16px",
                      cursor: "pointer",
                      background: notif.isRead
                        ? "transparent"
                        : "var(--accent-bg)",
                      borderBottom: "1px solid var(--border-subtle)",
                      transition: "background var(--transition)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = notif.isRead
                        ? "transparent"
                        : "var(--accent-bg)")
                    }
                  >
                    <div style={{ flexShrink: 0, paddingTop: 5 }}>
                      {!notif.isRead ? (
                        <div
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "var(--accent)",
                          }}
                        />
                      ) : (
                        <FiCheck
                          size={11}
                          style={{ color: "var(--success)" }}
                        />
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: notif.isRead ? 400 : 600,
                          fontSize: "0.85rem",
                          color: "var(--text-primary)",
                          marginBottom: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {notif.title}
                      </div>
                      {notif.content && (
                        <div
                          dangerouslySetInnerHTML={{ __html: notif.content }}
                          style={{
                            fontSize: "0.77rem",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        />
                      )}
                      <div
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--text-muted)",
                          marginTop: 3,
                        }}
                      >
                        {formatDate(notif.sentAt || notif.createdAt, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── User Dropdown ── */}
      <div ref={userRef} style={{ position: "relative" }}>
        <button
          onClick={() => setUserOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--sidebar-surface)",
            border: "1px solid var(--sidebar-border)",
            borderRadius: "var(--radius-sm)",
            padding: "7px 12px",
            color: "var(--sidebar-text)",
            cursor: "pointer",
            transition: "all var(--transition)",
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--sidebar-accent)";
            e.currentTarget.style.background = "var(--sidebar-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--sidebar-border)";
            e.currentTarget.style.background = "var(--sidebar-surface)";
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "var(--sidebar-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.75rem",
              flexShrink: 0,
            }}
          >
            {avatarLetter}
          </div>
          <div style={{ textAlign: "left", lineHeight: 1.3 }}>
            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>
              {displayName}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--sidebar-text-muted)",
              }}
            >
              {roleLabel}
            </div>
          </div>
          <FiChevronDown
            size={14}
            style={{
              color: "var(--sidebar-text-muted)",
              transform: userOpen ? "rotate(180deg)" : "none",
              transition: "transform var(--transition)",
            }}
          />
        </button>

        {userOpen && (
          <div className="header-dropdown animate-fadeIn">
            <Link
              to={`/${ADMIN}/my-account`}
              className="header-dropdown-item link"
              onClick={() => setUserOpen(false)}
            >
              <FiUser size={15} /> Tài khoản của tôi
            </Link>
            <div className="header-dropdown-divider" />
            <button
              className="header-dropdown-item danger"
              onClick={() => {
                setUserOpen(false);
                logout();
              }}
            >
              <FiLogOut size={15} /> Đăng xuất
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderComponent;
