import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPackage,
  FiUser,
  FiPhone,
  FiMapPin,
  FiAlertTriangle,
  FiCreditCard,
  FiCheck,
  FiX,
} from "react-icons/fi";
import {
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../../../services/admin/orderService";
import { formatCurrency, formatDate } from "../../../utils/format";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_CLASS,
  ORDER_STATUS_ICON,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_METHOD_LABEL,
  NEXT_VALID_STATUSES,
  STATUS_TIMELINE,
} from "./orderConstants";
import "../../../styles/admin/order.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

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

/* ── Status Timeline ── */
const StatusTimeline = ({ currentStatus }) => {
  const isCancelled = currentStatus === "CANCELLED";
  const currentIdx = STATUS_TIMELINE.indexOf(currentStatus);

  if (isCancelled) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 0",
        }}
      >
        <div className="status-step-dot cancelled">✕</div>
        <div>
          <div className="status-step-label" style={{ color: "var(--danger)" }}>
            Đơn hàng đã hủy
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="status-timeline">
      {STATUS_TIMELINE.map((step, idx) => {
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;
        return (
          <div
            key={step}
            className={`status-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
          >
            <div className="status-step-dot">
              {isDone ? <FiCheck size={11} /> : ORDER_STATUS_ICON[step]}
            </div>
            <div className="status-step-info">
              <div className="status-step-label">
                {ORDER_STATUS_LABEL[step]}
              </div>
              {isActive && (
                <div className="status-step-sub">Trạng thái hiện tại</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Order Item Row ── */
const OrderItemRow = ({ item }) => {
  const finalPrice =
    item.discountPercentage > 0
      ? item.price * (1 - item.discountPercentage / 100)
      : item.price;
  const subtotal = finalPrice * item.quantity;

  return (
    <tr>
      <td>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {item.bookThumbnail ? (
            <img src={item.bookThumbnail} alt="" className="order-item-thumb" />
          ) : (
            <div className="order-item-thumb-placeholder">
              <FiPackage size={16} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "var(--text-primary)",
              }}
            >
              {item.title}
            </div>
            {item.discountPercentage > 0 && (
              <span
                className="badge-admin badge-danger"
                style={{ marginTop: 4, fontSize: "0.7rem" }}
              >
                -{item.discountPercentage}%
              </span>
            )}
          </div>
        </div>
      </td>
      <td style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
          {formatCurrency(finalPrice)}
        </div>
        {item.discountPercentage > 0 && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              textDecoration: "line-through",
            }}
          >
            {formatCurrency(item.price)}
          </div>
        )}
      </td>
      <td style={{ textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
      <td
        style={{ textAlign: "right", fontWeight: 700, color: "var(--accent)" }}
      >
        {formatCurrency(subtotal)}
      </td>
    </tr>
  );
};

/* ══════════════════════════════════════════
   OrderDetailPage
═══════════════════════════════════════════ */
const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOrderById(id);
      setOrder(res.result);
    } catch {
      setError("Không thể tải thông tin đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleStatusUpdate = async () => {
    try {
      setActionLoading(true);
      const res = await updateOrderStatus(id, newStatus);
      setOrder(res.result);
      setNewStatus("");
      setModal(null);
      showToast(
        `Đã cập nhật trạng thái sang "${ORDER_STATUS_LABEL[newStatus]}"`,
      );
    } catch (err) {
      showToast(err?.response?.data?.message || "Cập nhật thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteOrder(id);
      showToast("Đã xóa đơn hàng thành công");
      setTimeout(() => navigate(`/${ADMIN}/order`), 1200);
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
      setModal(null);
    }
  };

  const shortId = (id) => id?.slice(0, 8).toUpperCase() ?? "—";

  if (loading) {
    return (
      <div className="order-detail-layout">
        {[500, 360].map((h, i) => (
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

  if (error || !order) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> {error || "Không tìm thấy đơn hàng"}
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/order`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>
    );
  }

  const nextStatuses = NEXT_VALID_STATUSES[order.status] ?? [];

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {modal === "status" && (
        <ConfirmModal
          title="Cập nhật trạng thái đơn hàng"
          message={
            <>
              Bạn có chắc muốn chuyển đơn hàng{" "}
              <strong>#{shortId(order.id)}</strong> sang trạng thái{" "}
              <strong style={{ color: "var(--accent)" }}>
                "{ORDER_STATUS_LABEL[newStatus]}"
              </strong>
              ?
            </>
          }
          confirmLabel="Xác nhận cập nhật"
          confirmClass="btn-primary-admin"
          onConfirm={handleStatusUpdate}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa đơn hàng"
          message={
            <>
              Bạn có chắc muốn xóa đơn hàng{" "}
              <strong>#{shortId(order.id)}</strong>?
            </>
          }
          note="⚠ Chỉ xóa được đơn PENDING hoặc CANCELLED."
          confirmLabel="Xóa đơn hàng"
          confirmClass="btn-danger-admin"
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/order`}>Quản lý đơn hàng</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          #{shortId(order.id)}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ fontSize: "1.3rem" }}>
            Đơn hàng #{shortId(order.id)}
          </h1>
          <p className="page-subtitle">
            Đặt lúc{" "}
            {formatDate(order.createdAt, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-secondary-admin"
            onClick={() => navigate(`/${ADMIN}/order`)}
          >
            <FiArrowLeft size={14} /> Quay lại
          </button>
          {hasPermission("ORDER_UPDATE") && (
            <Link to={`/${ADMIN}/order/edit/${order.id}`}>
              <button className="btn-primary-admin">
                <FiEdit2 size={14} /> Chỉnh sửa
              </button>
            </Link>
          )}
          {hasPermission("ORDER_DELETE") && (
            <button
              className="btn-danger-admin"
              onClick={() => setModal("delete")}
            >
              <FiTrash2 size={14} /> Xóa
            </button>
          )}
        </div>
      </div>

      <div className="order-detail-layout">
        {/* ── LEFT ── */}
        <div>
          {/* Sản phẩm */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiPackage size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">
                Sản phẩm ({order.orderItems?.length ?? 0} sản phẩm)
              </h3>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style={{ textAlign: "right", width: 120 }}>Đơn giá</th>
                    <th style={{ textAlign: "center", width: 70 }}>SL</th>
                    <th style={{ textAlign: "right", width: 120 }}>
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item) => (
                    <OrderItemRow key={item.id} item={item} />
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div style={{ marginTop: 16, paddingTop: 4 }}>
                <div className="order-total-row">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="order-total-row">
                  <span>Phí vận chuyển</span>
                  <span style={{ color: "var(--success)" }}>Miễn phí</span>
                </div>
                <div className="order-total-row total">
                  <span>Tổng cộng</span>
                  <span style={{ color: "var(--accent)" }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiUser size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin giao hàng</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                {[
                  { label: "Người nhận", value: order.fullName, icon: FiUser },
                  { label: "Số điện thoại", value: order.phone, icon: FiPhone },
                  { label: "Địa chỉ", value: order.address, icon: FiMapPin },
                  { label: "Ghi chú", value: order.note, icon: null },
                ].map(({ label, value }) => (
                  <div key={label} className="info-item">
                    <label>{label}</label>
                    <div className="info-value">
                      {value || (
                        <span
                          style={{
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}
                        >
                          —
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Thanh toán */}
          <div className="detail-section">
            <div className="detail-section-header">
              <FiCreditCard size={15} style={{ color: "var(--accent)" }} />
              <h3 className="detail-section-title">Thông tin thanh toán</h3>
            </div>
            <div className="detail-section-body">
              <div className="info-grid">
                <div className="info-item">
                  <label>Hình thức</label>
                  <div className="info-value">
                    <span className="payment-method-badge">
                      {order.paymentMethod === "VNPAY" ? "💳" : "💵"}{" "}
                      {PAYMENT_METHOD_LABEL[order.paymentMethod]}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <label>Trạng thái thanh toán</label>
                  <div className="info-value">
                    <span
                      className={`payment-status-badge ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}
                    >
                      {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                    </span>
                  </div>
                </div>
                {order.paidAt && (
                  <div className="info-item">
                    <label>Thanh toán lúc</label>
                    <div className="info-value">
                      {formatDate(order.paidAt, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
                {order.vnpayTransactionId && (
                  <div className="info-item">
                    <label>Mã giao dịch VNPay</label>
                    <div
                      className="info-value"
                      style={{ fontFamily: "monospace" }}
                    >
                      {order.vnpayTransactionId}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Summary card ── */}
        <div>
          <div className="order-summary-card">
            {/* Trạng thái hiện tại */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                Trạng thái đơn hàng
              </div>
              <span
                className={`order-status-badge ${ORDER_STATUS_CLASS[order.status]}`}
                style={{ fontSize: "0.875rem", padding: "5px 14px" }}
              >
                {ORDER_STATUS_ICON[order.status]}{" "}
                {ORDER_STATUS_LABEL[order.status]}
              </span>
            </div>

            {/* Timeline */}
            <StatusTimeline currentStatus={order.status} />

            {/* Cập nhật trạng thái */}
            {hasPermission("ORDER_APPROVE") && nextStatuses.length > 0 && (
              <div className="status-change-area" style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    marginBottom: 10,
                  }}
                >
                  Cập nhật trạng thái
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {nextStatuses.map((s) => (
                    <button
                      key={s}
                      className={
                        s === "CANCELLED"
                          ? "btn-danger-admin"
                          : "btn-primary-admin"
                      }
                      style={{ justifyContent: "center", padding: "8px" }}
                      onClick={() => {
                        setNewStatus(s);
                        setModal("status");
                      }}
                    >
                      {s === "CANCELLED" ? (
                        <FiX size={13} />
                      ) : (
                        <FiCheck size={13} />
                      )}
                      {ORDER_STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ID đầy đủ */}
            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                Mã đơn hàng đầy đủ
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  color: "var(--text-secondary)",
                  wordBreak: "break-all",
                }}
              >
                {order.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
