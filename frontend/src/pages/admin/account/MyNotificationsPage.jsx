import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheckSquare,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../../services/admin/profileService";
import { formatDate } from "../../../utils/format";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";
const PAGE_SIZE = 15;

const TYPE_LABEL = {
  ORDER_PLACED: "🛒 Đặt hàng",
  ORDER_STATUS_CHANGED: "📦 Cập nhật đơn",
  PROMOTION: "🎁 Khuyến mãi",
  FLASH_SALE: "⚡ Flash Sale",
  ANNOUNCEMENT: "📢 Thông báo",
  SYSTEM: "⚙️ Hệ thống",
};

const MyNotificationsPage = () => {
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [unread, setUnread] = useState(0);

  const fetchNotifs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyNotifications({
        page,
        size: PAGE_SIZE,
        sortBy: "newest",
      });
      const data = res?.result;
      setNotifs(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalItems(data?.totalElements ?? 0);
      setUnread((data?.content ?? []).filter((n) => !n.isRead).length);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const handleClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifs((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        /* silent */
      }
    }
    navigate(`/${ADMIN}/my-notifications/${notif.id}`);
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {
      /* silent */
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Thông báo của tôi</h1>
          <p className="page-subtitle">
            {totalItems} thông báo
            {unread > 0 && (
              <span style={{ color: "var(--accent)", marginLeft: 8 }}>
                · {unread} chưa đọc
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={fetchNotifs}
            title="Làm mới"
          >
            <FiRefreshCw size={14} />
          </button>
          {unread > 0 && (
            <button className="btn-secondary-admin" onClick={handleMarkAll}>
              <FiCheckSquare size={14} /> Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="skeleton"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  marginTop: 6,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skeleton"
                  style={{
                    height: 14,
                    borderRadius: 4,
                    marginBottom: 8,
                    width: "40%",
                  }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, borderRadius: 4 }}
                />
              </div>
            </div>
          ))
        ) : notifs.length === 0 ? (
          <div
            style={{
              padding: "56px 0",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <FiBell
              size={36}
              style={{ opacity: 0.2, display: "block", margin: "0 auto 12px" }}
            />
            Chưa có thông báo nào
          </div>
        ) : (
          notifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleClick(notif)}
              className="animate-fadeIn"
              style={{
                display: "flex",
                gap: 14,
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                background: notif.isRead ? "transparent" : "var(--accent-bg)",
                cursor: "pointer",
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
              {/* Dot / check */}
              <div style={{ flexShrink: 0, paddingTop: 6 }}>
                {!notif.isRead ? (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--border)",
                    }}
                  />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontWeight: notif.isRead ? 500 : 700,
                      fontSize: "0.9rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {notif.title}
                  </span>
                  {notif.type && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        padding: "1px 8px",
                        borderRadius: 99,
                        background: "var(--bg-raised)",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        flexShrink: 0,
                      }}
                    >
                      {TYPE_LABEL[notif.type] ?? notif.type}
                    </span>
                  )}
                </div>
                {notif.content && (
                  <div
                    dangerouslySetInnerHTML={{ __html: notif.content }}
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 600,
                    }}
                  />
                )}
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    marginTop: 5,
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="book-pagination" style={{ marginTop: 16 }}>
          <span className="pagination-info">
            {page * PAGE_SIZE + 1}–
            {Math.min((page + 1) * PAGE_SIZE, totalItems)} / {totalItems}
          </span>
          <div className="pagination-admin">
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <FiChevronLeft size={14} />
            </button>
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const pn =
                totalPages <= 7
                  ? i
                  : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
              return (
                <button
                  key={pn}
                  className={`page-btn ${pn === page ? "active" : ""}`}
                  onClick={() => setPage(pn)}
                >
                  {pn + 1}
                </button>
              );
            })}
            <button
              className="page-btn"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyNotificationsPage;
