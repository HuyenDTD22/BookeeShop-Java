import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiXCircle,
  FiBell,
  FiUsers,
  FiInfo,
  FiAlertTriangle,
  FiCheck,
} from "react-icons/fi";
import {
  getNotificationById,
  getNotificationReaders,
  deleteNotification,
  cancelNotification,
} from "../../../services/admin/notificationService";
import { formatDate } from "../../../utils/format";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  NOTIF_TYPE_LABEL,
  NOTIF_TYPE_CLASS,
  NOTIF_TYPE_ICON,
  NOTIF_STATUS_LABEL,
  NOTIF_STATUS_CLASS,
  NOTIF_STATUS_ICON,
  AUDIENCE_LABEL,
  AUDIENCE_ICON,
} from "./notificationConstants";
import "../../../styles/admin/notification.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Confirm Modal ── */
const ConfirmModal = ({
  title,
  message,
  note,
  confirmLabel,
  confirmClass,
  onConfirm,
  onCancel,
  loading,
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 2000,
      background: "rgba(15,28,53,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      className="animate-fadeIn"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 28,
        maxWidth: 420,
        width: "100%",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <h3
        style={{
          margin: "0 0 12px",
          fontSize: "1rem",
          fontFamily: "'Merriweather', serif",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          marginBottom: note ? 8 : 20,
          lineHeight: 1.6,
        }}
      >
        {message}
      </p>
      {note && (
        <p
          style={{
            color: "var(--warning)",
            fontSize: "0.82rem",
            marginBottom: 20,
            background: "var(--warning-bg)",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          {note}
        </p>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn-secondary-admin" onClick={onCancel}>
          Hủy
        </button>
        <button className={confirmClass} onClick={onConfirm} disabled={loading}>
          {loading && (
            <div
              className="spinner"
              style={{ width: 14, height: 14, borderWidth: 2 }}
            />
          )}
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

/* ── Toast ── */
const Toast = ({ message, type, onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 3000,
      background: type === "success" ? "var(--success-bg)" : "var(--danger-bg)",
      color: type === "success" ? "var(--success)" : "var(--danger)",
      border: `1px solid ${type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
      borderRadius: "var(--radius-md)",
      padding: "12px 18px",
      fontSize: "0.875rem",
      fontWeight: 500,
      boxShadow: "var(--shadow-lg)",
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 280,
    }}
  >
    <span>
      {type === "success" ? "✓" : "✕"} {message}
    </span>
    <button
      onClick={onClose}
      style={{
        marginLeft: "auto",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "inherit",
        fontSize: 18,
        lineHeight: 1,
      }}
    >
      ×
    </button>
  </div>
);

/* ── Reader Avatar ── */
const ReaderAvatar = ({ name }) => (
  <div className="reader-avatar">{(name || "?")[0].toUpperCase()}</div>
);

/* ══════════════════════════════════════════
   NotificationDetailPage
═══════════════════════════════════════════ */
const NotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [notification, setNotification] = useState(null);
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [notifRes, readersRes] = await Promise.all([
        getNotificationById(id),
        getNotificationReaders(id).catch(() => ({ result: [] })),
      ]);
      setNotification(notifRes.result);
      setReaders(readersRes.result ?? []);
    } catch {
      setError("Không thể tải thông tin thông báo.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteNotification(id);
      showToast("Đã xóa thông báo");
      setTimeout(() => navigate(`/${ADMIN}/notification`), 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      const res = await cancelNotification(id);
      setNotification(res.result);
      showToast("Đã hủy lịch gửi thông báo");
      setModal(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Hủy thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="notif-detail-layout">
        {[500, 300].map((h, i) => (
          <div
            key={i}
            style={{
              height: h,
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div className="skeleton" style={{ height: "100%" }} />
          </div>
        ))}
      </div>
    );
  }

  if (error || !notification) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy thông báo"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/notification`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const readPct =
    notification.totalRecipients > 0
      ? Math.round(
          (notification.readCount / notification.totalRecipients) * 100,
        )
      : 0;

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {modal === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa thông báo"
          message={
            <>
              Bạn có chắc muốn xóa{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{notification.title}"
              </strong>
              ?
            </>
          }
          note="⚠ Chỉ xóa được DRAFT hoặc SCHEDULED."
          confirmLabel="Xóa"
          confirmClass="btn-danger-admin"
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "cancel" && (
        <ConfirmModal
          title="Hủy lịch gửi"
          message={
            <>
              Bạn có chắc muốn hủy lịch gửi{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{notification.title}"
              </strong>
              ?
            </>
          }
          confirmLabel="Hủy lịch gửi"
          confirmClass="btn-danger-admin"
          onConfirm={handleCancel}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/notification`}>Quản lý thông báo</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {notification.title}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.3rem" }}>
            {notification.title}
          </h1>
          <p className="page-subtitle">
            Tạo bởi {notification.createdBy} ·{" "}
            {formatDate(notification.createdAt)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/notification`)}
          >
            <FiArrowLeft size={14} /> Quay lại
          </button>
          {["DRAFT", "SCHEDULED"].includes(notification.status) && (
            <Link to={`/${ADMIN}/notification/edit/${notification.id}`}>
              <button className="btn-primary-admin">
                <FiEdit2 size={14} /> Chỉnh sửa
              </button>
            </Link>
          )}
          {hasPermission("NOTIFICATION_CANCEL") &&
            notification.status === "SCHEDULED" && (
              <button
                className="btn-secondary-admin"
                onClick={() => setModal("cancel")}
                style={{
                  color: "var(--warning)",
                  borderColor: "rgba(245,158,11,0.4)",
                }}
              >
                <FiXCircle size={14} /> Hủy lịch gửi
              </button>
            )}
          {hasPermission("NOTIFICATION_DELETE") &&
            ["DRAFT", "SCHEDULED"].includes(notification.status) && (
              <button
                className="btn-danger-admin"
                onClick={() => setModal("delete")}
              >
                <FiTrash2 size={14} /> Xóa
              </button>
            )}
        </div>
      </div>

      <div className="notif-detail-layout">
        {/* ── LEFT ── */}
        <div>
          {/* Thông tin cơ bản */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiInfo size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin thông báo</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Loại thông báo</label>
                  <div className="info-value">
                    <span
                      className={`notif-type-badge ${NOTIF_TYPE_CLASS[notification.type]}`}
                    >
                      {NOTIF_TYPE_ICON[notification.type]}{" "}
                      {NOTIF_TYPE_LABEL[notification.type]}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Trạng thái</label>
                  <div className="info-value">
                    <span
                      className={`notif-status-badge ${NOTIF_STATUS_CLASS[notification.status]}`}
                    >
                      {NOTIF_STATUS_ICON[notification.status]}{" "}
                      {NOTIF_STATUS_LABEL[notification.status]}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Đối tượng nhận</label>
                  <div className="info-value">
                    <span className="audience-badge">
                      {AUDIENCE_ICON[notification.audienceType]}{" "}
                      {AUDIENCE_LABEL[notification.audienceType] ?? "—"}
                    </span>
                    {notification.targetRole && (
                      <span
                        style={{
                          marginLeft: 8,
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        (Role: {notification.targetRole})
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <label>Người tạo</label>
                  <div className="info-value">{notification.createdBy}</div>
                </div>
                {notification.scheduledAt && (
                  <div className="info-item">
                    <label>Lịch gửi</label>
                    <div
                      className="info-value"
                      style={{ color: "var(--warning)", fontWeight: 600 }}
                    >
                      {formatDate(notification.scheduledAt, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
                {notification.sentAt && (
                  <div className="info-item">
                    <label>Đã gửi lúc</label>
                    <div
                      className="info-value"
                      style={{ color: "var(--success)" }}
                    >
                      {formatDate(notification.sentAt, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nội dung */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiBell size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Nội dung thông báo</h3>
            </div>
            <div className="detail-section-body">
              <div
                dangerouslySetInnerHTML={{ __html: notification.content }}
                style={{
                  lineHeight: 1.75,
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              />
            </div>
          </div>

          {/* Danh sách người đọc */}
          {notification.status === "SENT" && (
            <div className="detail-section">
              <div className="detail-section-header">
                <FiUsers size={15} style={{ color: "var(--accent)" }} />
                <h3 className="detail-section-title">
                  Người đã đọc ({readers.length} /{" "}
                  {notification.totalRecipients ?? 0})
                </h3>
              </div>
              <div className="detail-section-body">
                {readers.length === 0 ? (
                  <p
                    style={{ color: "var(--text-muted)", fontStyle: "italic" }}
                  >
                    Chưa có ai đọc thông báo này
                  </p>
                ) : (
                  readers.map((reader) => (
                    <div
                      key={reader.userId ?? reader.username}
                      className="reader-row"
                    >
                      <ReaderAvatar name={reader.fullName || reader.username} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            color: "var(--text-primary)",
                          }}
                        >
                          {reader.fullName || "—"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          @{reader.username}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <FiCheck
                          size={13}
                          style={{ color: "var(--success)" }}
                        />
                        <span
                          style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                          }}
                        >
                          {reader.readAt
                            ? formatDate(reader.readAt, {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Stats ── */}
        <div>
          <div className="notif-stats-card">
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 16,
              }}
            >
              Thống kê
            </div>

            {/* Stats grid */}
            {[
              {
                label: "Tổng người nhận",
                value: notification.totalRecipients ?? 0,
                color: "var(--accent)",
              },
              {
                label: "Đã đọc",
                value: notification.readCount ?? 0,
                color: "var(--success)",
              },
              {
                label: "Chưa đọc",
                value:
                  (notification.totalRecipients ?? 0) -
                  (notification.readCount ?? 0),
                color: "var(--warning)",
              },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {label}
                </span>
                <span style={{ fontWeight: 700, fontSize: "1.1rem", color }}>
                  {value}
                </span>
              </div>
            ))}

            {/* Read progress bar */}
            {notification.status === "SENT" && (
              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  <span>Tỷ lệ đọc</span>
                  <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                    {readPct}%
                  </span>
                </div>
                <div className="read-progress-wrap">
                  <div
                    className="read-progress-fill"
                    style={{ width: `${readPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Status + type */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 14,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                Trạng thái
              </div>
              <span
                className={`notif-status-badge ${NOTIF_STATUS_CLASS[notification.status]}`}
              >
                {NOTIF_STATUS_ICON[notification.status]}{" "}
                {NOTIF_STATUS_LABEL[notification.status]}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginBottom: 8,
                }}
              >
                Loại
              </div>
              <span
                className={`notif-type-badge ${NOTIF_TYPE_CLASS[notification.type]}`}
              >
                {NOTIF_TYPE_ICON[notification.type]}{" "}
                {NOTIF_TYPE_LABEL[notification.type]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailPage;
