import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiEdit2,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiAlertTriangle,
} from "react-icons/fi";
import { getMyProfile } from "../../../services/admin/profileService";
import { formatDate } from "../../../utils/format";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

const InfoRow = ({ icon: Icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 14,
      padding: "12px 0",
      borderBottom: "1px solid var(--border-subtle)",
    }}
  >
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: "var(--radius-sm)",
        background: "var(--accent-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--accent)",
        flexShrink: 0,
      }}
    >
      <Icon size={15} />
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--text-muted)",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontWeight: 500,
          fontSize: "0.9rem",
          color: "var(--text-primary)",
        }}
      >
        {value || (
          <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            Chưa cập nhật
          </span>
        )}
      </div>
    </div>
  </div>
);

const MyAccountPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((res) => setProfile(res?.result))
      .catch(() => setError("Không thể tải thông tin tài khoản."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 24,
        }}
      >
        <div
          className="skeleton"
          style={{ height: 260, borderRadius: "var(--radius-lg)" }}
        />
        <div
          className="skeleton"
          style={{ height: 260, borderRadius: "var(--radius-lg)" }}
        />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="alert-admin alert-danger-admin">
        <FiAlertTriangle size={15} />{" "}
        {error || "Không tìm thấy thông tin tài khoản"}
      </div>
    );
  }

  const avatarLetter = (profile.fullName ||
    profile.username ||
    "?")[0].toUpperCase();
  const roleNames = profile.roles?.map((r) => r.name).join(", ") || "—";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Tài khoản của tôi</h1>
          <p className="page-subtitle">
            Thông tin cá nhân và cài đặt tài khoản
          </p>
        </div>
        <button
          className="btn-primary-admin"
          onClick={() => navigate(`/${ADMIN}/my-account/edit`)}
        >
          <FiEdit2 size={14} /> Chỉnh sửa
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Avatar card */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "28px 20px",
            boxShadow: "var(--shadow-sm)",
            textAlign: "center",
          }}
        >
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="avatar"
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--accent)",
                marginBottom: 12,
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #2e87e8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.8rem",
                fontWeight: 700,
                margin: "0 auto 12px",
              }}
            >
              {avatarLetter}
            </div>
          )}
          <div
            style={{
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            {profile.fullName || profile.username}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginBottom: 12,
            }}
          >
            @{profile.username}
          </div>
          <div
            style={{
              display: "inline-flex",
              padding: "3px 12px",
              borderRadius: 99,
              background: "var(--accent-bg)",
              color: "var(--accent)",
              border: "1px solid rgba(26,109,196,0.2)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {roleNames}
          </div>

          {profile.locked && (
            <div
              style={{
                marginTop: 10,
                padding: "4px 10px",
                borderRadius: 99,
                background: "var(--danger-bg)",
                color: "var(--danger)",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              🔒 Tài khoản bị khóa
            </div>
          )}
        </div>

        {/* Info */}
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px 28px",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--text-muted)",
              marginBottom: 16,
              fontWeight: 600,
            }}
          >
            Thông tin cá nhân
          </div>
          <InfoRow icon={FiUser} label="Họ và tên" value={profile.fullName} />
          <InfoRow
            icon={FiUser}
            label="Tên đăng nhập"
            value={profile.username}
          />
          <InfoRow icon={FiPhone} label="Số điện thoại" value={profile.phone} />
          <InfoRow icon={FiMapPin} label="Địa chỉ" value={profile.address} />
          <InfoRow
            icon={FiCalendar}
            label="Ngày tham gia"
            value={
              profile.createdAt
                ? formatDate(profile.createdAt, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : null
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MyAccountPage;
