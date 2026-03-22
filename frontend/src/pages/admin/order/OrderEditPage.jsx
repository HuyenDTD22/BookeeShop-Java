import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiSave,
  FiX,
  FiUser,
  FiCreditCard,
  FiAlertTriangle,
  FiPackage,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import {
  getOrderById,
  updateOrder,
} from "../../../services/admin/orderService";
import { formatCurrency } from "../../../utils/format";
import {
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  ORDER_STATUS_CLASS,
} from "./orderConstants";
import "../../../styles/admin/order.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Field ── */
const Field = ({ label, required, error, hint, children }) => (
  <div className="form-group-admin">
    <label className="form-label-admin">
      {label}
      {required && (
        <span style={{ color: "var(--danger)", marginLeft: 2 }}>*</span>
      )}
    </label>
    {children}
    {hint && (
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginTop: 4,
        }}
      >
        {hint}
      </p>
    )}
    {error && (
      <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: 4 }}>
        {error}
      </p>
    )}
  </div>
);

/* ══════════════════════════════════════════
   OrderEditPage
═══════════════════════════════════════════ */
const OrderEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "",
    paymentStatus: "",
  });
  // items: [{ orderItemId, title, bookThumbnail, price, discountPercentage, quantity, originalQty }]
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getOrderById(id)
      .then((res) => {
        const o = res.result;
        setOrder(o);
        setForm({
          fullName: o.fullName ?? "",
          phone: o.phone ?? "",
          address: o.address ?? "",
          note: o.note ?? "",
          paymentMethod: o.paymentMethod ?? "",
          paymentStatus: o.paymentStatus ?? "",
        });
        setItems(
          (o.orderItems ?? []).map((item) => ({
            orderItemId: item.id,
            title: item.title,
            bookThumbnail: item.bookThumbnail,
            price: item.price,
            discountPercentage: item.discountPercentage ?? 0,
            quantity: item.quantity,
            originalQty: item.quantity, // lưu qty gốc để so sánh
          })),
        );
      })
      .catch(() => showToast("Không thể tải thông tin đơn hàng.", "error"))
      .finally(() => setFetchLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /* ── Quantity helpers ── */
  const updateQty = (idx, delta) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }),
    );
  };

  const handleQtyInput = (idx, val) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 1) return;
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: n } : item)),
    );
  };

  /* ── Computed ── */
  const computedTotal = items.reduce((sum, item) => {
    const unitPrice =
      item.discountPercentage > 0
        ? item.price * (1 - item.discountPercentage / 100)
        : item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Vui lòng nhập tên người nhận";
    if (!form.phone.trim()) errs.phone = "Vui lòng nhập số điện thoại";
    if (form.phone && !/^\d{10,11}$/.test(form.phone))
      errs.phone = "Số điện thoại không hợp lệ";
    if (!form.address.trim()) errs.address = "Vui lòng nhập địa chỉ";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    try {
      setLoading(true);
      // Chỉ gửi items có thay đổi quantity
      const changedItems = items
        .filter((item) => item.quantity !== item.originalQty)
        .map((item) => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
        }));

      const data = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim() || undefined,
        paymentMethod: form.paymentMethod || undefined,
        paymentStatus: form.paymentStatus || undefined,
        ...(changedItems.length > 0 && { items: changedItems }),
      };
      await updateOrder(id, data);
      showToast("Cập nhật đơn hàng thành công!");
      setTimeout(() => navigate(`/${ADMIN}/order/detail/${id}`), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      showToast(msg || "Cập nhật thất bại.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isImmutable =
    order && ["SHIPPING", "CANCELLED", "COMPLETED"].includes(order.status);

  if (fetchLoading) {
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}
      >
        {[420, 280].map((h, i) => (
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

  if (!order) {
    return (
      <div>
        <div className="alert-admin alert-danger-admin">
          <FiAlertTriangle size={15} /> Không tìm thấy đơn hàng
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

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 3000,
            background:
              toast.type === "success"
                ? "var(--success-bg)"
                : "var(--danger-bg)",
            color:
              toast.type === "success" ? "var(--success)" : "var(--danger)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: "var(--radius-md)",
            padding: "12px 18px",
            fontSize: "0.875rem",
            fontWeight: 500,
            boxShadow: "var(--shadow-lg)",
            minWidth: 260,
            animation: "fadeIn 0.25s ease",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toast.type === "success" ? "✓" : "✕"} {toast.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="breadcrumb-nav">
        <Link to={`/${ADMIN}/order`}>Quản lý đơn hàng</Link>
        <span className="breadcrumb-sep">›</span>
        <Link to={`/${ADMIN}/order/detail/${id}`}>{order.orderCode}</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>Chỉnh sửa</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Chỉnh sửa đơn hàng {order.orderCode}</h1>
          <p className="page-subtitle">
            Cập nhật thông tin giao hàng, thanh toán và số lượng sản phẩm
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/order/detail/${id}`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      {/* Warning nếu không thể sửa */}
      {isImmutable && (
        <div
          className="animate-fadeIn"
          style={{
            marginBottom: 20,
            background: "var(--warning-bg)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "var(--warning)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
          }}
        >
          <FiAlertTriangle size={15} />
          Đơn hàng ở trạng thái{" "}
          <strong>{ORDER_STATUS_LABEL[order.status]}</strong> — không thể chỉnh
          sửa.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* ── LEFT ── */}
          <div>
            {/* Sản phẩm trong đơn */}
            <div className="form-section">
              <div className="form-section-header">
                <FiPackage size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">
                  Sản phẩm ({items.length})
                </h3>
              </div>
              <div className="form-section-body">
                {isImmutable
                  ? /* Readonly khi immutable */
                    items.map((item) => (
                      <div
                        key={item.orderItemId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 0",
                          borderBottom: "1px solid var(--border-subtle)",
                        }}
                      >
                        {item.bookThumbnail ? (
                          <img
                            src={item.bookThumbnail}
                            alt=""
                            style={{
                              width: 40,
                              height: 52,
                              objectFit: "cover",
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 40,
                              height: 52,
                              background: "var(--bg-raised)",
                              borderRadius: 4,
                              border: "1px solid var(--border)",
                              flexShrink: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <FiPackage
                              size={14}
                              style={{ color: "var(--text-muted)" }}
                            />
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <div
                            style={{ fontWeight: 600, fontSize: "0.875rem" }}
                          >
                            {item.title}
                          </div>
                          <div
                            style={{
                              fontSize: "0.78rem",
                              color: "var(--text-muted)",
                              marginTop: 2,
                            }}
                          >
                            {formatCurrency(
                              item.discountPercentage > 0
                                ? item.price *
                                    (1 - item.discountPercentage / 100)
                                : item.price,
                            )}{" "}
                            × {item.quantity}
                          </div>
                        </div>
                        <div
                          style={{ fontWeight: 700, color: "var(--accent)" }}
                        >
                          {formatCurrency(
                            (item.discountPercentage > 0
                              ? item.price * (1 - item.discountPercentage / 100)
                              : item.price) * item.quantity,
                          )}
                        </div>
                      </div>
                    ))
                  : /* Editable */
                    items.map((item, idx) => {
                      const unitPrice =
                        item.discountPercentage > 0
                          ? item.price * (1 - item.discountPercentage / 100)
                          : item.price;
                      const changed = item.quantity !== item.originalQty;

                      return (
                        <div
                          key={item.orderItemId}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 0",
                            borderBottom: "1px solid var(--border-subtle)",
                          }}
                        >
                          {/* Thumbnail */}
                          {item.bookThumbnail ? (
                            <img
                              src={item.bookThumbnail}
                              alt=""
                              style={{
                                width: 44,
                                height: 56,
                                objectFit: "cover",
                                borderRadius: 4,
                                border: "1px solid var(--border)",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 44,
                                height: 56,
                                background: "var(--bg-raised)",
                                borderRadius: 4,
                                border: "1px solid var(--border)",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FiPackage
                                size={16}
                                style={{ color: "var(--text-muted)" }}
                              />
                            </div>
                          )}

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 600,
                                fontSize: "0.875rem",
                                color: "var(--text-primary)",
                              }}
                            >
                              {item.title}
                              {changed && (
                                <span
                                  style={{
                                    marginLeft: 8,
                                    fontSize: "0.7rem",
                                    padding: "1px 6px",
                                    background: "var(--warning-bg)",
                                    color: "var(--warning)",
                                    borderRadius: 99,
                                    fontWeight: 600,
                                  }}
                                >
                                  Đã thay đổi
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--text-muted)",
                                marginTop: 2,
                              }}
                            >
                              {formatCurrency(unitPrice)} / cuốn
                              {item.discountPercentage > 0 && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    textDecoration: "line-through",
                                  }}
                                >
                                  {formatCurrency(item.price)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity stepper */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => updateQty(idx, -1)}
                              disabled={item.quantity <= 1}
                              style={{ width: 28, height: 28 }}
                            >
                              <FiMinus size={12} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                handleQtyInput(idx, e.target.value)
                              }
                              min={1}
                              style={{
                                width: 52,
                                textAlign: "center",
                                border: `1px solid ${changed ? "var(--warning)" : "var(--border)"}`,
                                borderRadius: "var(--radius-sm)",
                                padding: "4px 6px",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                background: "var(--bg-surface)",
                                color: "var(--text-primary)",
                                outline: "none",
                              }}
                            />
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => updateQty(idx, 1)}
                              style={{ width: 28, height: 28 }}
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          {/* Subtotal */}
                          <div
                            style={{
                              fontWeight: 700,
                              color: "var(--accent)",
                              fontSize: "0.9rem",
                              minWidth: 90,
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(unitPrice * item.quantity)}
                          </div>
                        </div>
                      );
                    })}

                {/* Tổng mới */}
                {!isImmutable && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      marginTop: 12,
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-muted)",
                          marginBottom: 4,
                        }}
                      >
                        Tổng cộng (sau chỉnh sửa)
                      </div>
                      <div
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "var(--accent)",
                        }}
                      >
                        {formatCurrency(computedTotal)}
                      </div>
                      {computedTotal !== order.totalAmount && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            textDecoration: "line-through",
                          }}
                        >
                          Cũ: {formatCurrency(order.totalAmount)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin giao hàng */}
            <div className="form-section">
              <div className="form-section-header">
                <FiUser size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thông tin giao hàng</h3>
              </div>
              <div className="form-section-body">
                <Field label="Tên người nhận" required error={errors.fullName}>
                  <input
                    name="fullName"
                    className="form-control-admin"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={isImmutable}
                    style={
                      errors.fullName ? { borderColor: "var(--danger)" } : {}
                    }
                  />
                </Field>
                <Field label="Số điện thoại" required error={errors.phone}>
                  <input
                    name="phone"
                    className="form-control-admin"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isImmutable}
                    style={errors.phone ? { borderColor: "var(--danger)" } : {}}
                  />
                </Field>
                <Field
                  label="Địa chỉ giao hàng"
                  required
                  error={errors.address}
                >
                  <textarea
                    name="address"
                    className="form-control-admin"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    disabled={isImmutable}
                    style={{
                      resize: "vertical",
                      ...(errors.address
                        ? { borderColor: "var(--danger)" }
                        : {}),
                    }}
                  />
                </Field>
                <Field label="Ghi chú">
                  <input
                    name="note"
                    className="form-control-admin"
                    value={form.note}
                    onChange={handleChange}
                    disabled={isImmutable}
                    placeholder="Ghi chú từ khách hàng..."
                  />
                </Field>
              </div>
            </div>

            {/* Thanh toán */}
            <div className="form-section">
              <div className="form-section-header">
                <FiCreditCard size={14} style={{ color: "var(--accent)" }} />
                <h3 className="form-section-title">Thanh toán</h3>
              </div>
              <div className="form-section-body">
                <div className="form-row-2">
                  <Field label="Hình thức">
                    <select
                      name="paymentMethod"
                      className="form-control-admin"
                      value={form.paymentMethod}
                      onChange={handleChange}
                      disabled={isImmutable}
                    >
                      <option value="COD">COD</option>
                      <option value="VNPAY">VNPay</option>
                    </select>
                  </Field>
                  <Field label="Trạng thái thanh toán">
                    <select
                      name="paymentStatus"
                      className="form-control-admin"
                      value={form.paymentStatus}
                      onChange={handleChange}
                      disabled={isImmutable}
                    >
                      {Object.entries(PAYMENT_STATUS_LABEL).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Summary + submit ── */}
          <div>
            <div className="order-summary-card">
              <div
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 14,
                }}
              >
                Tổng quan đơn hàng
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                <div className="order-total-row">
                  <span>Số sản phẩm</span>
                  <span>{items.length} loại</span>
                </div>
                <div className="order-total-row">
                  <span>Tổng số lượng</span>
                  <span>{items.reduce((s, i) => s + i.quantity, 0)} cuốn</span>
                </div>
                <div className="order-total-row total">
                  <span>Tổng tiền</span>
                  <span style={{ color: "var(--accent)" }}>
                    {formatCurrency(
                      isImmutable ? order.totalAmount : computedTotal,
                    )}
                  </span>
                </div>
              </div>

              {/* Current status */}
              <div
                style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}
              >
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    marginBottom: 6,
                  }}
                >
                  Trạng thái
                </div>
                <span
                  className={`order-status-badge ${ORDER_STATUS_CLASS[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              {/* Order code */}
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--text-muted)",
                    marginBottom: 4,
                  }}
                >
                  Mã đơn hàng
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontWeight: 700,
                    color: "var(--accent)",
                    fontSize: "0.9rem",
                  }}
                >
                  {order.orderCode}
                </div>
              </div>
            </div>

            {/* Submit */}
            {!isImmutable && (
              <div className="form-submit-area" style={{ marginTop: 16 }}>
                <button
                  type="submit"
                  className="btn-primary-admin"
                  disabled={loading}
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: "12px 20px",
                    opacity: loading ? 0.75 : 1,
                  }}
                >
                  {loading ? (
                    <>
                      <div
                        className="spinner"
                        style={{ width: 16, height: 16, borderWidth: 2 }}
                      />{" "}
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FiSave size={15} /> Lưu thay đổi
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn-secondary-admin"
                  onClick={() => navigate(`/${ADMIN}/order/detail/${id}`)}
                  style={{ padding: "12px 16px" }}
                >
                  <FiX size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderEditPage;
