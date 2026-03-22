import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiExternalLink,
} from "react-icons/fi";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../../../services/client/clientNotificationService";
import "../../../styles/client/notification.css";

/* ── Helpers ── */
const fmtDate = (d) => {
  if (!d) return "";
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const TYPE_ICON = {
  ORDER_PLACED: "🎉",
  ORDER_STATUS_CHANGED: "📦",
  PROMOTION: "🏷️",
  FLASH_SALE: "⚡",
  ANNOUNCEMENT: "📢",
  SYSTEM: "⚙️",
};
const TYPE_LABEL = {
  ORDER_PLACED: "Đơn hàng",
  ORDER_STATUS_CHANGED: "Cập nhật đơn",
  PROMOTION: "Khuyến mãi",
  FLASH_SALE: "Flash sale",
  ANNOUNCEMENT: "Thông báo",
  SYSTEM: "Hệ thống",
};
const TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: "ORDER_PLACED", label: "Đơn hàng" },
  { key: "ORDER_STATUS_CHANGED", label: "Cập nhật đơn" },
  { key: "PROMOTION", label: "Khuyến mãi" },
  { key: "FLASH_SALE", label: "Flash sale" },
  { key: "ANNOUNCEMENT", label: "Thông báo" },
];

/* isRead có thể là boolean true/false hoặc field tên 'read' tuỳ Jackson config */
const getIsRead = (n) => Boolean(n.isRead ?? n.read);

/* ══════════════════════════════════════════
   Detail Modal
═══════════════════════════════════════════ */
const NotifDetailModal = ({ notif, onClose, onNavigate }) => {
  if (!notif) return null;
  const isRead = getIsRead(notif);
  const icon = TYPE_ICON[notif.type] ?? "🔔";
  const typeLabel = TYPE_LABEL[notif.type] ?? notif.type;

  const handleNavigate = () => {
    const type = notif.type;
    if (
      (type === "ORDER_PLACED" || type === "ORDER_STATUS_CHANGED") &&
      notif.refId
    ) {
      onNavigate("/orders");
    }
    onClose();
  };

  const isOrderType =
    notif.type === "ORDER_PLACED" || notif.type === "ORDER_STATUS_CHANGED";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,28,53,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
        backdropFilter: "blur(3px)",
        animation: "fadeIn 0.15s ease",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 500,
          boxShadow: "var(--shadow-lg)",
          animation: "slideUp 0.2s ease",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 20px",
            borderBottom: "1px solid var(--c-border)",
            background: "var(--c-raised)",
          }}
        >
          <div
            className={`ntf-icon ${notif.type}`}
            style={{ width: 40, height: 40, fontSize: "1rem" }}
          >
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--c-text)",
              }}
            >
              {notif.title}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 4,
              }}
            >
              <span className={`ntf-type-badge ${notif.type}`}>
                {typeLabel}
              </span>
              <span
                style={{ fontSize: "0.72rem", color: "var(--c-text-muted)" }}
              >
                {fmtDate(notif.sentAt ?? notif.createdAt)}
              </span>
              {isRead && (
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "#10b981",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <FiCheckCircle size={11} /> Đã đọc
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "none",
              border: "1px solid var(--c-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--c-text-muted)",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--c-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
            }}
          >
            <FiX size={15} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", maxHeight: "60vh", overflowY: "auto" }}>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--c-text-2)",
              lineHeight: 1.7,
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {notif.content}
          </p>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid var(--c-border)",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          {isOrderType && notif.refId && (
            <button
              onClick={handleNavigate}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 18px",
                background: "var(--c-accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--c-accent-dim, #155aa0)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--c-accent)")
              }
            >
              <FiExternalLink size={14} /> Xem đơn hàng
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              background: "transparent",
              color: "var(--c-text-2)",
              border: "1px solid var(--c-border)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--c-accent)";
              e.currentTarget.style.color = "var(--c-accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--c-border)";
              e.currentTarget.style.color = "var(--c-text-2)";
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Pagination ── */
const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages - 1, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="ntf-pagination">
      <button
        className="ntf-page-btn"
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
      >
        <FiChevronLeft size={14} />
      </button>
      {start > 0 && (
        <>
          <button className="ntf-page-btn" onClick={() => onChange(0)}>
            1
          </button>
          {start > 1 && (
            <span style={{ color: "var(--c-text-muted)", padding: "0 4px" }}>
              …
            </span>
          )}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={`ntf-page-btn ${p === page ? "active" : ""}`}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}
      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && (
            <span style={{ color: "var(--c-text-muted)", padding: "0 4px" }}>
              …
            </span>
          )}
          <button
            className="ntf-page-btn"
            onClick={() => onChange(totalPages - 1)}
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        className="ntf-page-btn"
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
      >
        <FiChevronRight size={14} />
      </button>
    </div>
  );
};

/* ── Notification item ── */
const NotifItem = ({ notif, onOpen }) => {
  const isUnread = !getIsRead(notif);
  const icon = TYPE_ICON[notif.type] ?? "🔔";
  const typeLabel = TYPE_LABEL[notif.type] ?? notif.type;

  return (
    <div
      className={`ntf-item ${isUnread ? "unread" : ""}`}
      onClick={() => onOpen(notif)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen(notif)}
    >
      <div className={`ntf-icon ${notif.type}`}>{icon}</div>
      <div className="ntf-content">
        <div className="ntf-title">{notif.title}</div>
        {/* Preview 2 dòng nội dung — click để xem đầy đủ */}
        <div className="ntf-body">{notif.content}</div>
        <div className="ntf-meta">
          <span className={`ntf-type-badge ${notif.type}`}>{typeLabel}</span>
          <span>{fmtDate(notif.sentAt ?? notif.createdAt)}</span>
          {!isUnread && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                color: "#10b981",
                fontSize: "0.72rem",
              }}
            >
              <FiCheckCircle size={11} /> Đã đọc
            </span>
          )}
        </div>
      </div>
      {/* Fix lỗi 3: hiện chấm xanh rõ ràng khi chưa đọc */}
      {isUnread && <div className="ntf-unread-dot" />}
    </div>
  );
};

/* ══════════════════════════════════════════
   NotificationsPage
═══════════════════════════════════════════ */
const NotificationsPage = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [page, setPage] = useState(0);
  const [markingAll, setMarkingAll] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null); // modal

  const unreadCount = notifications.filter((n) => !getIsRead(n)).length;

  const fetchNotifs = useCallback(async (p = 0, type = "ALL") => {
    try {
      setLoading(true);
      setError("");
      // Fix lỗi 1: gửi đúng params — chỉ thêm type nếu không phải ALL
      const params = { page: p, size: 15, sortBy: "newest" };
      if (type !== "ALL") params.type = type;
      const res = await getMyNotifications(params);
      const data = res?.result;
      setNotifications(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 0);
      setTotalElements(data?.totalElements ?? 0);
    } catch {
      setError("Không thể tải thông báo. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifs(page, activeTab);
  }, [page, activeTab, fetchNotifs]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(0);
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* Fix lỗi 2: mở modal chi tiết + đánh dấu đọc */
  const handleOpen = async (notif) => {
    setSelectedNotif(notif);
    if (!getIsRead(notif)) {
      try {
        await markAsRead(notif.id);
      } catch {
        /* silent */
      }
      // Cập nhật local state — hỗ trợ cả 'isRead' lẫn 'read'
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id
            ? {
                ...n,
                isRead: true,
                read: true,
                readAt: new Date().toISOString(),
              }
            : n,
        ),
      );
      setSelectedNotif((s) => (s ? { ...s, isRead: true, read: true } : s));
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarkingAll(true);
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          read: true,
          readAt: new Date().toISOString(),
        })),
      );
    } catch {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="client-container ntf-page">
      <nav className="ntf-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <span>Thông báo</span>
      </nav>

      <div className="ntf-header">
        <h1 className="ntf-page-title">
          <FiBell size={20} style={{ color: "var(--c-accent)" }} />
          Thông báo
          {totalElements > 0 && (
            <span
              style={{
                fontSize: "0.82rem",
                fontWeight: 400,
                color: "var(--c-text-muted)",
                fontFamily: "inherit",
              }}
            >
              ({totalElements})
            </span>
          )}
          {unreadCount > 0 && (
            <span className="ntf-unread-badge">{unreadCount} chưa đọc</span>
          )}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="ntf-mark-all-btn"
            onClick={() => fetchNotifs(page, activeTab)}
            disabled={loading}
          >
            <FiRefreshCw size={13} /> Làm mới
          </button>
          {unreadCount > 0 && (
            <button
              className="ntf-mark-all-btn"
              onClick={handleMarkAll}
              disabled={markingAll}
            >
              <FiCheck size={13} />
              {markingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="ntf-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`ntf-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.key !== "ALL" && <span>{TYPE_ICON[tab.key]}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="ntf-spinner" />
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div
            style={{
              color: "var(--c-danger)",
              marginBottom: 16,
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <FiAlertCircle size={16} /> {error}
          </div>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 18px",
              background: "var(--c-accent)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
            onClick={() => fetchNotifs(page, activeTab)}
          >
            <FiRefreshCw size={13} /> Thử lại
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="ntf-empty">
          <div className="ntf-empty-icon">🔔</div>
          <p className="ntf-empty-text">
            {activeTab === "ALL"
              ? "Bạn chưa có thông báo nào."
              : `Không có thông báo loại "${TABS.find((t) => t.key === activeTab)?.label}".`}
          </p>
        </div>
      ) : (
        <>
          {notifications.map((notif) => (
            <NotifItem key={notif.id} notif={notif} onOpen={handleOpen} />
          ))}
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        </>
      )}

      {/* Detail Modal */}
      {selectedNotif && (
        <NotifDetailModal
          notif={selectedNotif}
          onClose={() => setSelectedNotif(null)}
          onNavigate={(path) => {
            navigate(path);
            setSelectedNotif(null);
          }}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
