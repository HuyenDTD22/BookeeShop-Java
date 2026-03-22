import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingCart,
  FiCheckSquare,
  FiSquare,
  FiCalendar,
} from "react-icons/fi";
import {
  getOrders,
  deleteOrder,
  bulkUpdateOrderStatus,
  updateOrderStatus,
} from "../../../services/admin/orderService";
import { formatCurrency, formatDate } from "../../../utils/format";
import { AuthContext } from "../../../contexts/AuthContext";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_CLASS,
  PAYMENT_METHOD_LABEL,
  NEXT_VALID_STATUSES,
} from "./orderConstants";
import "../../../styles/admin/order.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";
const PAGE_SIZE = 10;

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

/* ── Status Quick-Change Dropdown ── */
const StatusDropdown = ({ order, onChanged, onError }) => {
  const [dropPos, setDropPos] = useState(null); // null=đóng, {top,left}=mở
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const nextStatuses = NEXT_VALID_STATUSES[order.status] ?? [];

  const handleOpen = () => {
    if (dropPos) {
      setDropPos(null);
      return;
    }
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
    }
  };

  const handleSelect = async (newStatus) => {
    try {
      setLoading(true);
      setDropPos(null);
      await updateOrderStatus(order.id, newStatus);
      onChanged();
    } catch (err) {
      onError(err?.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (nextStatuses.length === 0) {
    return (
      <span
        className={`order-status-badge ${ORDER_STATUS_CLASS[order.status]}`}
      >
        {ORDER_STATUS_LABEL[order.status]}
      </span>
    );
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={loading}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
        title="Click để đổi trạng thái"
      >
        <span
          className={`order-status-badge ${ORDER_STATUS_CLASS[order.status]}`}
          style={{
            cursor: "pointer",
            textDecoration: "underline dotted",
            textUnderlineOffset: 3,
          }}
        >
          {loading ? (
            <>
              <div
                className="spinner"
                style={{ width: 10, height: 10, borderWidth: 2 }}
              />{" "}
              {ORDER_STATUS_LABEL[order.status]}
            </>
          ) : (
            ORDER_STATUS_LABEL[order.status]
          )}
          {" ▾"}
        </span>
      </button>

      {/* Portal — render NGOÀI mọi DOM container, thẳng vào document.body */}
      {dropPos &&
        createPortal(
          <>
            {/* Overlay trong suốt */}
            <div
              style={{ position: "fixed", inset: 0, zIndex: 9998 }}
              onClick={() => setDropPos(null)}
            />
            {/* Dropdown */}
            <div
              style={{
                position: "fixed",
                top: dropPos.top,
                left: dropPos.left,
                transform: "translateX(-50%)",
                zIndex: 9999,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                minWidth: 172,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "7px 12px",
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "var(--bg-raised)",
                }}
              >
                Chuyển trạng thái
              </div>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSelect(s)}
                  style={{
                    width: "100%",
                    padding: "9px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <span
                    className={`order-status-badge ${ORDER_STATUS_CLASS[s]}`}
                    style={{ fontSize: "0.72rem", padding: "2px 8px" }}
                  >
                    {ORDER_STATUS_LABEL[s]}
                  </span>
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </>
  );
};

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

/* ══════════════════════════════════════════
   OrderListPage
═══════════════════════════════════════════ */
const OrderListPage = () => {
  const { hasPermission } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  /* Filters */
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  /* Bulk select */
  const [selected, setSelected] = useState(new Set());
  const [bulkStatus, setBulkStatus] = useState("");

  /* Modal & action */
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSelected(new Set());
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy,
        ...(keyword && { keyword }),
        ...(status && { status }),
        ...(paymentMethod && { paymentMethod }),
        ...(paymentStatus && { paymentStatus }),
        ...(fromDate && { fromDate: fromDate + "T00:00:00" }),
        ...(toDate && { toDate: toDate + "T23:59:59" }),
      };
      const res = await getOrders(params);
      const data = res?.result;
      setOrders(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalItems(data?.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    sortBy,
    keyword,
    status,
    paymentMethod,
    paymentStatus,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setKeyword("");
    setStatus("");
    setPaymentMethod("");
    setPaymentStatus("");
    setSortBy("newest");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteOrder(modal.order.id);
      showToast("Đã xóa đơn hàng thành công");
      setModal(null);
      fetchOrders();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return;
    try {
      setActionLoading(true);
      await bulkUpdateOrderStatus([...selected], bulkStatus);
      showToast(
        `Đã cập nhật ${selected.size} đơn hàng sang "${ORDER_STATUS_LABEL[bulkStatus]}"`,
      );
      setBulkStatus("");
      setModal(null);
      fetchOrders();
    } catch (err) {
      showToast(err?.response?.data?.message || "Cập nhật thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map((o) => o.id)));
  };

  const validBulkStatuses =
    selected.size > 0
      ? ["CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"].filter((s) =>
          [...selected].every((id) => {
            const order = orders.find((o) => o.id === id);
            return order && NEXT_VALID_STATUSES[order.status]?.includes(s);
          }),
        )
      : [];

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {modal?.type === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa đơn hàng"
          message={
            <>
              Bạn có chắc muốn xóa đơn hàng{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                {modal.order.orderCode}
              </strong>
              ?
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
      {modal?.type === "bulk" && (
        <ConfirmModal
          title={`Cập nhật ${selected.size} đơn hàng`}
          message={
            <>
              Chuyển <strong>{selected.size}</strong> đơn hàng đã chọn sang{" "}
              <strong style={{ color: "var(--accent)" }}>
                "{ORDER_STATUS_LABEL[bulkStatus]}"
              </strong>
              ?
            </>
          }
          confirmLabel="Xác nhận"
          confirmClass="btn-primary-admin"
          onConfirm={handleBulkUpdate}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý đơn hàng</h1>
          <p className="page-subtitle">{totalItems} đơn hàng trong hệ thống</p>
        </div>
      </div>

      {error && (
        <div
          className="alert-admin alert-danger-admin animate-fadeIn"
          style={{ marginBottom: 20 }}
        >
          <FiAlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Toolbar row 1 */}
      <div className="book-list-toolbar">
        <form className="book-search-wrap" onSubmit={handleSearch}>
          <FiSearch size={15} className="search-icon" />
          <input
            className="book-search-input"
            placeholder="Tìm theo tên, số điện thoại..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <div className="book-filter-group">
          <select
            className="filter-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả hình thức</option>
            <option value="COD">COD</option>
            <option value="VNPAY">VNPay</option>
          </select>
          <select
            className="filter-select"
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả thanh toán</option>
            <option value="PENDING">Chưa thanh toán</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
          <button
            className="btn-secondary-admin"
            onClick={resetFilters}
            title="Đặt lại"
          >
            <FiRefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Toolbar row 2: Date range */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: "0.875rem",
            color: "var(--text-secondary)",
          }}
        >
          <FiCalendar size={14} style={{ color: "var(--accent)" }} />
          <span style={{ fontWeight: 500 }}>Lọc theo ngày:</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="date"
            className="filter-select"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(0);
            }}
            style={{ minWidth: 140 }}
          />
          <span style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
            đến
          </span>
          <input
            type="date"
            className="filter-select"
            value={toDate}
            min={fromDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(0);
            }}
            style={{ minWidth: 140 }}
          />
          {(fromDate || toDate) && (
            <button
              className="btn-secondary-admin"
              style={{ fontSize: "0.78rem", padding: "5px 10px" }}
              onClick={() => {
                setFromDate("");
                setToDate("");
                setPage(0);
              }}
            >
              Xóa ngày
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && hasPermission("ORDER_APPROVE") && (
        <div
          className="animate-fadeIn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 16px",
            marginBottom: 16,
            background: "var(--accent-bg)",
            border: "1px solid rgba(26,109,196,0.2)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--accent)",
            }}
          >
            Đã chọn {selected.size} đơn hàng
          </span>
          <select
            className="filter-select"
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            style={{ minWidth: 180 }}
          >
            <option value="">Chọn trạng thái mới...</option>
            {validBulkStatuses.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            className="btn-primary-admin"
            disabled={!bulkStatus}
            onClick={() => setModal({ type: "bulk" })}
            style={{ opacity: !bulkStatus ? 0.5 : 1 }}
          >
            Áp dụng
          </button>
          <button
            className="btn-secondary-admin"
            onClick={() => setSelected(new Set())}
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* Table */}
      <div className="book-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 44, textAlign: "center" }}>
                <button
                  onClick={toggleSelectAll}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {selected.size === orders.length && orders.length > 0 ? (
                    <FiCheckSquare
                      size={15}
                      style={{ color: "var(--accent)" }}
                    />
                  ) : (
                    <FiSquare size={15} />
                  )}
                </button>
              </th>
              <th style={{ width: 150 }}>Mã đơn</th>
              <th>Khách hàng</th>
              <th style={{ width: 130 }}>Tổng tiền</th>
              <th style={{ width: 100 }}>Hình thức</th>
              <th style={{ width: 130, textAlign: "center" }}>Thanh toán</th>
              <th style={{ width: 150, textAlign: "center" }}>Trạng thái</th>
              <th style={{ width: 120 }}>Ngày đặt</th>
              <th style={{ width: 100, textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(9)].map((__, j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ height: 16, borderRadius: 4 }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <FiShoppingCart
                    size={36}
                    style={{
                      opacity: 0.25,
                      display: "block",
                      margin: "0 auto 12px",
                    }}
                  />
                  Không có đơn hàng nào
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  <td style={{ textAlign: "center" }}>
                    <button
                      onClick={() => toggleSelect(order.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {selected.has(order.id) ? (
                        <FiCheckSquare
                          size={15}
                          style={{ color: "var(--accent)" }}
                        />
                      ) : (
                        <FiSquare size={15} />
                      )}
                    </button>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        color: "var(--accent)",
                      }}
                    >
                      {order.orderCode ??
                        `#${order.id?.slice(0, 8).toUpperCase()}`}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {order.fullName}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {order.phone}
                    </div>
                  </td>
                  <td
                    style={{
                      fontWeight: 700,
                      color: "var(--accent)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td>
                    <span className="payment-method-badge">
                      {order.paymentMethod === "VNPAY" ? "💳" : "💵"}{" "}
                      {PAYMENT_METHOD_LABEL[order.paymentMethod] ??
                        order.paymentMethod}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`payment-status-badge ${PAYMENT_STATUS_CLASS[order.paymentStatus]}`}
                    >
                      {PAYMENT_STATUS_LABEL[order.paymentStatus] ??
                        order.paymentStatus}
                    </span>
                  </td>
                  {/* Trạng thái — click để đổi nhanh */}
                  <td style={{ textAlign: "center" }}>
                    {hasPermission("ORDER_APPROVE") ? (
                      <StatusDropdown
                        order={order}
                        onChanged={fetchOrders}
                        onError={(msg) => showToast(msg, "error")}
                      />
                    ) : (
                      <span
                        className={`order-status-badge ${ORDER_STATUS_CLASS[order.status]}`}
                      >
                        {ORDER_STATUS_LABEL[order.status]}
                      </span>
                    )}
                  </td>
                  <td
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {formatDate(order.createdAt, {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      {hasPermission("ORDER_VIEW") && (
                        <Link to={`/${ADMIN}/order/detail/${order.id}`}>
                          <button
                            className="btn-icon"
                            data-tooltip="Xem chi tiết"
                          >
                            <FiEye size={14} />
                          </button>
                        </Link>
                      )}
                      {hasPermission("ORDER_UPDATE") && (
                        <Link to={`/${ADMIN}/order/edit/${order.id}`}>
                          <button className="btn-icon" data-tooltip="Chỉnh sửa">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                      )}
                      {hasPermission("ORDER_DELETE") && (
                        <button
                          className="btn-icon"
                          data-tooltip="Xóa"
                          onClick={() => setModal({ type: "delete", order })}
                          style={{
                            borderColor: "rgba(239,68,68,0.3)",
                            color: "var(--danger)",
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="book-pagination">
            <span className="pagination-info">
              Hiển thị {page * PAGE_SIZE + 1}–
              {Math.min((page + 1) * PAGE_SIZE, totalItems)} / {totalItems} đơn
              hàng
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
                const pageNum =
                  totalPages <= 7
                    ? i
                    : Math.max(0, Math.min(page - 3, totalPages - 7)) + i;
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pageNum === page ? "active" : ""}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
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
    </div>
  );
};

export default OrderListPage;
