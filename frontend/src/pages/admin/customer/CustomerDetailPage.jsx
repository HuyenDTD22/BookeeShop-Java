import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
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
  getCustomerById,
  toggleLockCustomer,
  deleteCustomer,
} from "../../../services/admin/customerService";
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
  if (user?.avatar) {
    return <img src={user.avatar} alt="" className="user-avatar-lg" />;
  }
  return <div className="user-avatar-placeholder-lg">{initial}</div>;
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
   CustomerDetailPage
═══════════════════════════════════════════ */
const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCustomer = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getCustomerById(id);
      setCustomer(res.result);
    } catch {
      setError("Không thể tải thông tin khách hàng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  const handleToggleLock = async () => {
    try {
      setActionLoading(true);
      const res = await toggleLockCustomer(id);
      setCustomer(res.result);
      showToast(
        `Đã ${customer?.locked ? "mở khóa" : "khóa"} tài khoản thành công`,
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
      await deleteCustomer(id);
      showToast("Đã xóa tài khoản thành công");
      setTimeout(() => navigate(`/${ADMIN}/customer`), 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  /* Loading skeleton */
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

  if (error || !customer) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy khách hàng"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/customer`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Confirm modals */}
      {modal === "lock" && (
        <ConfirmModal
          title={customer.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          message={
            <>
              Bạn có chắc muốn {customer.locked ? "mở khóa" : "khóa"} tài khoản{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{customer.fullName || customer.username}"
              </strong>
              ?
            </>
          }
          confirmLabel={customer.locked ? "Mở khóa" : "Khóa tài khoản"}
          confirmClass={
            customer.locked ? "btn-primary-admin" : "btn-danger-admin"
          }
          icon={customer.locked ? FiUnlock : FiLock}
          onConfirm={handleToggleLock}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa khách hàng"
          message={
            <>
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{customer.fullName || customer.username}"
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
        <Link to={`/${ADMIN}/customer`}>Quản lý khách hàng</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {customer.fullName || customer.username}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.3rem" }}>
            {customer.fullName || customer.username}
          </h1>
          <p className="page-subtitle">@{customer.username}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/customer`)}
          >
            <FiArrowLeft size={14} /> Quay lại
          </button>
          {hasPermission("CUSTOMER_UPDATE") && (
            <button
              className={
                customer.locked ? "btn-primary-admin" : "btn-secondary-admin"
              }
              onClick={() => setModal("lock")}
              style={
                !customer.locked
                  ? {
                      color: "var(--warning)",
                      borderColor: "rgba(245,158,11,0.4)",
                    }
                  : {}
              }
            >
              {customer.locked ? <FiUnlock size={14} /> : <FiLock size={14} />}
              {customer.locked ? "Mở khóa" : "Khóa tài khoản"}
            </button>
          )}
          {hasPermission("CUSTOMER_DELETE") && (
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
        {/* ── Left: Profile card ── */}
        <div>
          <div className="user-profile-card">
            {/* Avatar */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <AvatarLg user={customer} />
            </div>

            <div className="user-profile-name">{customer.fullName || "—"}</div>
            <div className="user-profile-username">@{customer.username}</div>

            {/* Status badge */}
            {customer.locked ? (
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

            {/* Roles */}
            {customer.roles?.length > 0 && (
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
                  {customer.roles.map((role) => (
                    <span key={role.id} className="role-tag">
                      <FiShield size={10} /> {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Detail sections ── */}
        <div>
          {/* Thông tin cơ bản */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiInfo size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin cơ bản</h3>
            </div>
            <div className="detail-section-body">
              <InfoRow
                icon={FiUser}
                label="Họ và tên"
                value={customer.fullName}
              />
              <InfoRow
                icon={FiUser}
                label="Tên đăng nhập"
                value={`@${customer.username}`}
              />
              <InfoRow
                icon={FiPhone}
                label="Số điện thoại"
                value={customer.phone}
              />
              <InfoRow
                icon={FiCalendar}
                label="Ngày sinh"
                value={customer.dob ? formatDate(customer.dob) : null}
              />
              <InfoRow
                icon={FiUser}
                label="Giới tính"
                value={
                  customer.gender === "MALE"
                    ? "Nam"
                    : customer.gender === "FEMALE"
                      ? "Nữ"
                      : customer.gender === "OTHER"
                        ? "Khác"
                        : null
                }
              />
              <InfoRow
                icon={FiMapPin}
                label="Địa chỉ"
                value={customer.address}
              />
            </div>
          </div>

          {/* Trạng thái tài khoản */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiShield size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Trạng thái tài khoản</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Trạng thái</label>
                  <div className="info-value">
                    {customer.locked ? (
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
                  <label>Vai trò</label>
                  <div className="role-tags" style={{ marginTop: 4 }}>
                    {customer.roles?.map((role) => (
                      <span key={role.id} className="role-tag">
                        <FiShield size={10} /> {role.name}
                      </span>
                    )) || "—"}
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

export default CustomerDetailPage;
