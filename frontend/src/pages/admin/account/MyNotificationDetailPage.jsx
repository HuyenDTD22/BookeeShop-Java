import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiBell, FiAlertTriangle } from "react-icons/fi";
import {
  getMyNotificationById,
  markNotificationAsRead,
} from "../../../services/admin/profileService";
import { formatDate } from "../../../utils/format";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const TYPE_LABEL = {
  ORDER_PLACED: "🛒 Đặt hàng thành công",
  ORDER_STATUS_CHANGED: "📦 Cập nhật đơn hàng",
  PROMOTION: "🎁 Khuyến mãi",
  FLASH_SALE: "⚡ Flash Sale",
  ANNOUNCEMENT: "📢 Thông báo chung",
  SYSTEM: "⚙️ Hệ thống nội bộ",
};

const MyNotificationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [notif, setNotif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyNotificationById(id);
        const n = res?.result;
        setNotif(n);
        // Đánh dấu đã đọc nếu chưa đọc
        if (n && !n.isRead) {
          await markNotificationAsRead(id).catch(() => {});
        }
      } catch {
        setError("Không thể tải thông báo.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <div
          className="skeleton"
          style={{ height: 300, borderRadius: "var(--radius-lg)" }}
        />
      </div>
    );
  }

  if (error || !notif) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy thông báo"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/my-notifications`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/my-notifications`}>Thông báo của tôi</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>{notif.title}</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.25rem" }}>
            {notif.title}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 6,
            }}
          >
            {notif.type && (
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "2px 10px",
                  borderRadius: 99,
                  background: "var(--accent-bg)",
                  color: "var(--accent)",
                  border: "1px solid rgba(26,109,196,0.2)",
                  fontWeight: 600,
                }}
              >
                {TYPE_LABEL[notif.type] ?? notif.type}
              </span>
            )}
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {formatDate(notif.sentAt || notif.createdAt, {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/my-notifications`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "28px 32px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div className="form-section-header" style={{ marginBottom: 20 }}>
          <FiBell size={15} style={{ color: "var(--accent)" }} />
          <h3
            style={{
              fontFamily: "'Merriweather', serif",
              fontSize: "0.9rem",
              fontWeight: 700,
            }}
          >
            Nội dung
          </h3>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: notif.content }}
          style={{
            lineHeight: 1.8,
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
          }}
        />

        {/* Nếu thông báo liên quan đến đơn hàng → link đến đơn */}
        {notif.refId &&
          (notif.type === "ORDER_PLACED" ||
            notif.type === "ORDER_STATUS_CHANGED") && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
              }}
            >
              <Link
                to={`/${ADMIN}/order/detail/${notif.refId}`}
                className="btn-primary-admin"
                style={{ textDecoration: "none", display: "inline-flex" }}
              >
                Xem đơn hàng
              </Link>
            </div>
          )}
      </div>
    </div>
  );
};

export default MyNotificationDetailPage;
