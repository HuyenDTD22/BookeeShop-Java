import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPackage,
  FiClock,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiAlertCircle,
  FiShoppingBag,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import {
  getMyOrders,
  cancelMyOrder,
} from "../../../services/client/orderService";
import "../../../styles/client/order.css";
import RatingPanel from "../../../components/client/book/RatingPanel";

/* ══════════════════════════════════════════
   Constants
═══════════════════════════════════════════ */
const fmtPrice = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const STATUS_META = {
  PENDING: {
    label: "Chờ xác nhận",
    icon: <FiClock size={12} />,
    cls: "PENDING",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    icon: <FiCheckCircle size={12} />,
    cls: "CONFIRMED",
  },
  SHIPPING: {
    label: "Đang giao",
    icon: <FiTruck size={12} />,
    cls: "SHIPPING",
  },
  COMPLETED: {
    label: "Hoàn thành",
    icon: <FiCheckCircle size={12} />,
    cls: "COMPLETED",
  },
  CANCELLED: {
    label: "Đã hủy",
    icon: <FiXCircle size={12} />,
    cls: "CANCELLED",
  },
};

const PAY_METHOD_LABEL = { COD: "Tiền mặt (COD)", VNPAY: "VNPay" };
const PAY_STATUS_LABEL = {
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
};

const STEPS = [
  { key: "PENDING", label: "Chờ\nxác nhận", icon: "📋" },
  { key: "CONFIRMED", label: "Đã\nxác nhận", icon: "✓" },
  { key: "SHIPPING", label: "Đang\ngiao", icon: "🚚" },
  { key: "COMPLETED", label: "Hoàn\nthành", icon: "🎉" },
];

const STEP_ORDER = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED"];

const TABS = [
  { key: "ALL", label: "Tất cả", icon: <FiPackage size={14} /> },
  { key: "PENDING", label: "Chờ xác nhận", icon: <FiClock size={14} /> },
  { key: "CONFIRMED", label: "Đã xác nhận", icon: <FiCheckCircle size={14} /> },
  { key: "SHIPPING", label: "Đang giao", icon: <FiTruck size={14} /> },
  { key: "COMPLETED", label: "Hoàn thành", icon: <FiCheckCircle size={14} /> },
  { key: "CANCELLED", label: "Đã hủy", icon: <FiXCircle size={14} /> },
];

/* ══════════════════════════════════════════
   Stepper component
═══════════════════════════════════════════ */
const OrderStepper = ({ status }) => {
  if (status === "CANCELLED") {
    return (
      <div className="ord-stepper">
        <div className="ord-step cancelled">
          <div className="ord-step-dot">
            <FiX size={12} />
          </div>
          <span className="ord-step-label">Đã hủy</span>
        </div>
      </div>
    );
  }
  const currentIdx = STEP_ORDER.indexOf(status);
  return (
    <div className="ord-stepper">
      {STEPS.map((step, idx) => {
        const cls =
          idx < currentIdx ? "done" : idx === currentIdx ? "active" : "";
        return (
          <div key={step.key} className={`ord-step ${cls}`}>
            <div className="ord-step-dot">
              {idx < currentIdx ? <FiCheck size={11} /> : step.icon}
            </div>
            <span className="ord-step-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ══════════════════════════════════════════
   Cancel Confirm Dialog
═══════════════════════════════════════════ */
const CancelDialog = ({ orderCode, onConfirm, onCancel, loading }) => (
  <div className="ord-confirm-overlay" onClick={onCancel}>
    <div className="ord-confirm-box" onClick={(e) => e.stopPropagation()}>
      <h3 className="ord-confirm-title">Hủy đơn hàng?</h3>
      <p className="ord-confirm-text">
        Bạn có chắc muốn hủy đơn hàng <strong>{orderCode}</strong> không? Hành
        động này không thể hoàn tác.
      </p>
      <div className="ord-confirm-actions">
        <button
          className="ord-btn ord-btn-outline"
          onClick={onCancel}
          disabled={loading}
        >
          Giữ lại
        </button>
        <button
          className="ord-btn ord-btn-danger"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Đang hủy..." : "Xác nhận hủy"}
        </button>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════
   Order Card
═══════════════════════════════════════════ */
const OrderCard = ({ order, onCancelRequest, onRefresh }) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const meta = STATUS_META[order.status] ?? STATUS_META.PENDING;
  const items = order.orderItems ?? [];
  const preview = items.slice(0, 2);
  const more = items.length - preview.length;

  return (
    <div className="ord-card">
      {/* ── Header ── */}
      <div className="ord-card-header">
        <FiPackage
          size={15}
          style={{ color: "var(--c-accent)", flexShrink: 0 }}
        />
        <span className="ord-card-code">
          #{order.orderCode ?? order.id?.slice(0, 8).toUpperCase()}
        </span>
        <span className="ord-card-date">{fmtDate(order.createdAt)}</span>
        <div className="ord-card-header-right">
          <span className={`ord-status-badge ${meta.cls}`}>
            {meta.icon} {meta.label}
          </span>
          <span className={`ord-pay-badge ${order.paymentStatus}`}>
            {PAY_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
          </span>
        </div>
      </div>

      {/* ── Stepper ── */}
      <OrderStepper status={order.status} />

      {/* ── Items preview ── */}
      <div className="ord-items">
        {preview.map((item) => {
          const finalPrice =
            item.discountPercentage > 0
              ? item.price * (1 - item.discountPercentage / 100)
              : item.price;
          return (
            <div key={item.id} className="ord-item-row">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="ord-item-thumb"
                />
              ) : (
                <div className="ord-item-thumb-ph">📚</div>
              )}
              <div className="ord-item-info">
                <Link to={`/books/${item.bookId}`} className="ord-item-title">
                  {item.title}
                </Link>
                <div className="ord-item-meta">
                  {item.discountPercentage > 0 && (
                    <span style={{ marginRight: 6 }}>
                      -{Math.round(item.discountPercentage)}%
                    </span>
                  )}
                  SL: {item.quantity}
                </div>
              </div>
              <div className="ord-item-price-wrap">
                <div className="ord-item-final">
                  {fmtPrice(finalPrice * item.quantity)}
                </div>
                {item.discountPercentage > 0 && (
                  <div className="ord-item-orig">{fmtPrice(item.price)}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* More items toggle */}
      {more > 0 && !expanded && (
        <div className="ord-more-items" onClick={() => setExpanded(true)}>
          + {more} sản phẩm khác ▾
        </div>
      )}

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="ord-detail-panel">
          {/* Remaining items */}
          {items.slice(2).map((item) => {
            const fp =
              item.discountPercentage > 0
                ? item.price * (1 - item.discountPercentage / 100)
                : item.price;
            return (
              <div
                key={item.id}
                className="ord-item-row"
                style={{ marginBottom: 14 }}
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="ord-item-thumb"
                  />
                ) : (
                  <div className="ord-item-thumb-ph">📚</div>
                )}
                <div className="ord-item-info">
                  <Link to={`/books/${item.bookId}`} className="ord-item-title">
                    {item.title}
                  </Link>
                  <div className="ord-item-meta">SL: {item.quantity}</div>
                </div>
                <div className="ord-item-price-wrap">
                  <div className="ord-item-final">
                    {fmtPrice(fp * item.quantity)}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Order info grid */}
          <div
            className="ord-detail-grid"
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: "1px solid var(--c-border)",
            }}
          >
            <div>
              <div className="ord-detail-section-title">Thông tin đơn hàng</div>
              <div className="ord-detail-row">
                <span className="ord-detail-key">Mã đơn:</span>
                <span
                  className="ord-detail-val"
                  style={{ fontFamily: "monospace" }}
                >
                  #{order.orderCode ?? "—"}
                </span>
              </div>
              <div className="ord-detail-row">
                <span className="ord-detail-key">Thanh toán:</span>
                <span className="ord-detail-val">
                  {PAY_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}
                </span>
              </div>
              {order.vnpayTransactionId && (
                <div className="ord-detail-row">
                  <span className="ord-detail-key">Mã GD VNPay:</span>
                  <span
                    className="ord-detail-val"
                    style={{ fontFamily: "monospace", fontSize: "0.78rem" }}
                  >
                    {order.vnpayTransactionId}
                  </span>
                </div>
              )}
              {order.paidAt && (
                <div className="ord-detail-row">
                  <span className="ord-detail-key">Thanh toán lúc:</span>
                  <span className="ord-detail-val">
                    {fmtDate(order.paidAt)}
                  </span>
                </div>
              )}
              {order.note && (
                <div className="ord-detail-row">
                  <span className="ord-detail-key">Ghi chú:</span>
                  <span className="ord-detail-val">{order.note}</span>
                </div>
              )}
            </div>
            <div>
              <div className="ord-detail-section-title">
                Thông tin giao hàng
              </div>
              <div className="ord-detail-row">
                <span className="ord-detail-key">Người nhận:</span>
                <span className="ord-detail-val">{order.fullName}</span>
              </div>
              <div className="ord-detail-row">
                <span className="ord-detail-key">Điện thoại:</span>
                <span className="ord-detail-val">{order.phone}</span>
              </div>
              <div className="ord-detail-row">
                <span className="ord-detail-key">Địa chỉ:</span>
                <span className="ord-detail-val">{order.address}</span>
              </div>
            </div>
          </div>

          <button
            className="ord-btn ord-btn-outline"
            style={{ marginTop: 12, fontSize: "0.78rem" }}
            onClick={() => setExpanded(false)}
          >
            <FiChevronUp size={13} /> Thu gọn
          </button>
        </div>
      )}

      {/* ── Rating Panel — chỉ hiện khi COMPLETED ── */}
      {order.status === "COMPLETED" && <RatingPanel order={order} />}

      {/* ── Footer ── */}
      <div className="ord-card-footer">
        <div>
          <div className="ord-total-label">Tổng tiền</div>
          <div className="ord-total-amount">{fmtPrice(order.totalAmount)}</div>
        </div>
        <div className="ord-card-actions">
          {/* Xem chi tiết */}
          {!expanded && (
            <button
              className="ord-btn ord-btn-outline"
              onClick={() => setExpanded(true)}
            >
              <FiChevronDown size={13} /> Chi tiết
            </button>
          )}

          {/* Mua lại — completed hoặc cancelled → link đến sách đầu tiên */}
          {(order.status === "COMPLETED" || order.status === "CANCELLED") &&
            items[0]?.bookId && (
              <Link
                to={`/books/${items[0].bookId}`}
                className="ord-btn ord-btn-outline"
              >
                <FiShoppingBag size={13} /> Mua lại
              </Link>
            )}

          {/* Hủy đơn — chỉ PENDING */}
          {order.status === "PENDING" && (
            <button
              className="ord-btn ord-btn-danger"
              onClick={() => onCancelRequest(order)}
            >
              <FiXCircle size={13} /> Hủy đơn
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════
   OrdersPage
═══════════════════════════════════════════ */
const OrdersPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [cancelOrder, setCancelOrder] = useState(null); // order to cancel
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getMyOrders();
      setOrders(res?.result ?? []);
    } catch {
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelConfirm = async () => {
    if (!cancelOrder) return;
    try {
      setCancelling(true);
      await cancelMyOrder(cancelOrder.id);
      setCancelOrder(null);
      await fetchOrders(); // refresh
    } catch (err) {
      const msg = err?.response?.data?.message ?? "";
      alert(
        msg.includes("PENDING")
          ? "Chỉ có thể hủy đơn đang chờ xác nhận."
          : "Hủy đơn thất bại. Vui lòng thử lại.",
      );
    } finally {
      setCancelling(false);
    }
  };

  // Filter by tab
  const filtered =
    activeTab === "ALL" ? orders : orders.filter((o) => o.status === activeTab);

  // Count per tab
  const countByStatus = (status) =>
    orders.filter((o) => o.status === status).length;

  return (
    <div className="client-container ord-page">
      {/* Breadcrumb */}
      <nav className="ord-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>›</span>
        <span>Đơn hàng của tôi</span>
      </nav>

      <h1 className="ord-page-title">
        <FiPackage size={22} style={{ color: "var(--c-accent)" }} />
        Đơn hàng của tôi
        {orders.length > 0 && (
          <span
            style={{
              fontSize: "0.85rem",
              fontFamily: "inherit",
              fontWeight: 400,
              color: "var(--c-text-muted)",
            }}
          >
            ({orders.length} đơn)
          </span>
        )}
      </h1>

      {/* ── Tabs ── */}
      <div className="ord-tabs">
        {TABS.map((tab) => {
          const cnt = tab.key === "ALL" ? 0 : countByStatus(tab.key);
          return (
            <button
              key={tab.key}
              className={`ord-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
              {cnt > 0 && <span className="ord-tab-badge">{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="ord-spinner" />
      ) : error ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div
            style={{
              color: "var(--c-danger)",
              marginBottom: 16,
              fontSize: "0.9rem",
            }}
          >
            <FiAlertCircle size={16} style={{ marginRight: 6 }} />
            {error}
          </div>
          <button className="ord-btn ord-btn-primary" onClick={fetchOrders}>
            <FiRefreshCw size={13} /> Thử lại
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ord-empty">
          <div className="ord-empty-icon">📦</div>
          <p className="ord-empty-text">
            {activeTab === "ALL"
              ? "Bạn chưa có đơn hàng nào."
              : `Không có đơn hàng nào ở trạng thái "${TABS.find((t) => t.key === activeTab)?.label}".`}
          </p>
          <Link to="/" className="ord-empty-btn">
            <FiShoppingBag size={14} /> Mua sắm ngay
          </Link>
        </div>
      ) : (
        filtered.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onCancelRequest={setCancelOrder}
            onRefresh={fetchOrders}
          />
        ))
      )}

      {/* ── Cancel confirm dialog ── */}
      {cancelOrder && (
        <CancelDialog
          orderCode={`#${cancelOrder.orderCode ?? cancelOrder.id?.slice(0, 8).toUpperCase()}`}
          onConfirm={handleCancelConfirm}
          onCancel={() => setCancelOrder(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
};

export default OrdersPage;
