import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiUser,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiAlertTriangle,
  FiShield,
  FiInfo,
} from "react-icons/fi";
import {
  getStaffById,
  toggleLockStaff,
  deleteStaff,
} from "../../../services/admin/staffService";
import { formatDate } from "../../../utils/format";
import { AuthContext } from "../../../contexts/AuthContext";
import "../../../styles/admin/customer.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Confirm Modal ── */
const ConfirmModal = ({
  title,
  message,
  note,
  confirmLabel,
  confirmClass,
  icon: Icon,
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            background: "var(--danger-bg)",
            borderRadius: "var(--radius-sm)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--danger)",
          }}
        >
          <Icon size={18} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            fontFamily: "'Merriweather', serif",
          }}
        >
          {title}
        </h3>
      </div>
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
            lineHeight: 1.5,
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
          {loading ? (
            <div
              className="spinner"
              style={{ width: 14, height: 14, borderWidth: 2 }}
            />
          ) : (
            <Icon size={14} />
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
      animation: "fadeIn 0.25s ease",
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

/* ── Avatar Large ── */
const AvatarLg = ({ user }) => {
  const initial = (user?.fullName || user?.username || "?")[0]?.toUpperCase();
  if (user?.avatar)
    return <img src={user.avatar} alt="" className="user-avatar-lg" />;
  return (
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1a6dc4, #7c3aed)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: "2rem",
        fontWeight: 700,
        border: "3px solid rgba(124,58,237,0.2)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {initial}
    </div>
  );
};

/* ── Info Row ── */
const InfoRow = ({ icon: Icon, label, value }) => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
      padding: "12px 0",
      borderBottom: "1px solid var(--border-subtle)",
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        background: "var(--accent-bg)",
        borderRadius: "var(--radius-sm)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--accent)",
        flexShrink: 0,
      }}
    >
      <Icon size={14} />
    </div>
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "0.9rem",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          fontWeight: value ? 500 : 400,
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value || "Chưa cập nhật"}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   StaffDetailPage
═══════════════════════════════════════════ */
const StaffDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getStaffById(id);
      setStaff(res.result);
    } catch {
      setError("Không thể tải thông tin nhân viên.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleToggleLock = async () => {
    try {
      setActionLoading(true);
      const res = await toggleLockStaff(id);
      setStaff(res.result);
      showToast(
        `Đã ${staff?.locked ? "mở khóa" : "khóa"} tài khoản thành công`,
      );
      setModal(null);
    } catch (err) {
      showToast(err?.response?.data?.message || "Thao tác thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteStaff(id);
      showToast("Đã xóa tài khoản thành công");
      setTimeout(() => navigate(`/${ADMIN}/staff`), 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}
      >
        {[320, 400].map((h, i) => (
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

  if (error || !staff) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy nhân viên"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/staff`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {modal === "lock" && (
        <ConfirmModal
          title={staff.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          message={
            <>
              Bạn có chắc muốn {staff.locked ? "mở khóa" : "khóa"} tài khoản{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{staff.fullName || staff.username}"
              </strong>
              ?
            </>
          }
          confirmLabel={staff.locked ? "Mở khóa" : "Khóa"}
          confirmClass={staff.locked ? "btn-primary-admin" : "btn-danger-admin"}
          icon={staff.locked ? FiUnlock : FiLock}
          onConfirm={handleToggleLock}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa nhân viên"
          message={
            <>
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{staff.fullName || staff.username}"
              </strong>
              ?
            </>
          }
          note="⚠ Hành động này không thể hoàn tác."
          confirmLabel="Xóa tài khoản"
          confirmClass="btn-danger-admin"
          icon={FiTrash2}
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/staff`}>Quản lý nhân sự</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {staff.fullName || staff.username}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.3rem" }}>
            {staff.fullName || staff.username}
          </h1>
          <p className="page-subtitle">@{staff.username}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/staff`)}
          >
            <FiArrowLeft size={14} /> Quay lại
          </button>
          {hasPermission("STAFF_UPDATE") && (
            <Link to={`/${ADMIN}/staff/edit/${staff.id}`}>
              <button className="btn-primary-admin">
                <FiEdit2 size={14} /> Chỉnh sửa
              </button>
            </Link>
          )}
          {hasPermission("STAFF_UPDATE") && (
            <button
              className={
                staff.locked ? "btn-primary-admin" : "btn-secondary-admin"
              }
              onClick={() => setModal("lock")}
              style={
                !staff.locked
                  ? {
                      color: "var(--warning)",
                      borderColor: "rgba(245,158,11,0.4)",
                    }
                  : {}
              }
            >
              {staff.locked ? <FiUnlock size={14} /> : <FiLock size={14} />}
              {staff.locked ? "Mở khóa" : "Khóa"}
            </button>
          )}
          {hasPermission("STAFF_DELETE") && (
            <button
              className="btn-danger-admin"
              onClick={() => setModal("delete")}
            >
              <FiTrash2 size={14} /> Xóa
            </button>
          )}
        </div>
      </div>

      <div className="user-detail-layout">
        {/* Left: Profile card */}
        <div>
          <div className="user-profile-card">
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AvatarLg user={staff} />
            </div>
            <div className="user-profile-name">{staff.fullName || "—"}</div>
            <div className="user-profile-username">@{staff.username}</div>

            {staff.locked ? (
              <span
                className="badge-admin badge-danger"
                style={{ marginBottom: 4 }}
              >
                <FiLock size={11} /> Đã khóa
              </span>
            ) : (
              <span
                className="badge-admin badge-success"
                style={{ marginBottom: 4 }}
              >
                Đang hoạt động
              </span>
            )}

            {/* Vai trò — hiển thị displayName */}
            {staff.roles?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Vai trò
                </div>
                <div className="role-tags" style={{ justifyContent: "center" }}>
                  {staff.roles.map((role) => (
                    <span key={role.id} className="role-tag">
                      <FiShield size={10} /> {role.displayName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ngày tạo */}
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
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Ngày tạo tài khoản
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  marginTop: 4,
                }}
              >
                {formatDate(staff.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Detail */}
        <div>
          <div className="detail-section">
            <div className="detail-section-header">
              <FiInfo size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin cơ bản</h3>
            </div>
            <div className="detail-section-body">
              <InfoRow icon={FiUser} label="Họ và tên" value={staff.fullName} />
              <InfoRow
                icon={FiUser}
                label="Tên đăng nhập"
                value={`@${staff.username}`}
              />
              <InfoRow
                icon={FiPhone}
                label="Số điện thoại"
                value={staff.phone}
              />
              <InfoRow
                icon={FiCalendar}
                label="Ngày sinh"
                value={staff.dob ? formatDate(staff.dob) : null}
              />
              <InfoRow
                icon={FiUser}
                label="Giới tính"
                value={
                  staff.gender === "MALE"
                    ? "Nam"
                    : staff.gender === "FEMALE"
                      ? "Nữ"
                      : staff.gender === "OTHER"
                        ? "Khác"
                        : null
                }
              />
              <InfoRow icon={FiMapPin} label="Địa chỉ" value={staff.address} />
            </div>
          </div>

          <div className="detail-section">
            <div className="detail-section-header">
              <FiShield size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Phân quyền & Trạng thái</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Trạng thái</label>
                  <div className="info-value">
                    {staff.locked ? (
                      <span className="badge-admin badge-danger">
                        <FiLock size={11} /> Đã khóa
                      </span>
                    ) : (
                      <span className="badge-admin badge-success">
                        Hoạt động
                      </span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <label>Vai trò được gán</label>
                  {/* Hiển thị displayName thay vì name */}
                  <div className="role-tags" style={{ marginTop: 4 }}>
                    {staff.roles?.length ? (
                      staff.roles.map((role) => (
                        <span key={role.id} className="role-tag">
                          <FiShield size={10} /> {role.displayName}
                        </span>
                      ))
                    ) : (
                      <span
                        style={{
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Chưa có vai trò
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailPage;
