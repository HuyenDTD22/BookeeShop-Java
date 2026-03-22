import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiXCircle,
  FiPlus,
  FiAlertTriangle,
  FiRefreshCw,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
} from "react-icons/fi";
import {
  getNotifications,
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
   NotificationListPage
═══════════════════════════════════════════ */
const NotificationListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  /* Filters */
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  /* Modal & action */
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy,
        ...(keyword && { keyword }),
        ...(typeFilter && { type: typeFilter }),
        ...(statusFilter && { status: statusFilter }),
        ...(fromDate && { fromDate: fromDate + "T00:00:00" }),
        ...(toDate && { toDate: toDate + "T23:59:59" }),
      };
      const res = await getNotifications(params);
      const data = res?.result;
      setNotifications(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalItems(data?.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, keyword, typeFilter, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const resetFilters = () => {
    setSearchInput("");
    setKeyword("");
    setTypeFilter("");
    setStatusFilter("");
    setFromDate("");
    setToDate("");
    setSortBy("newest");
    setPage(0);
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      await deleteNotification(modal.id);
      showToast("Đã xóa thông báo thành công");
      setModal(null);
      fetchNotifications();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await cancelNotification(modal.id);
      showToast("Đã hủy thông báo đã lên lịch");
      setModal(null);
      fetchNotifications();
    } catch (err) {
      showToast(err?.response?.data?.message || "Hủy thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {modal?.type === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa thông báo"
          message={
            <>
              Bạn có chắc muốn xóa thông báo{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{modal.title}"
              </strong>
              ?
            </>
          }
          note="⚠ Chỉ xóa được thông báo DRAFT hoặc SCHEDULED."
          confirmLabel="Xóa thông báo"
          confirmClass="btn-danger-admin"
          onConfirm={handleDelete}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal?.type === "cancel" && (
        <ConfirmModal
          title="Hủy lịch gửi thông báo"
          message={
            <>
              Bạn có chắc muốn hủy lịch gửi{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{modal.title}"
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

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý thông báo</h1>
          <p className="page-subtitle">{totalItems} thông báo trong hệ thống</p>
        </div>
        {hasPermission("NOTIFICATION_CREATE") && (
          <button
            className="btn-primary-admin"
            onClick={() => navigate(`/${ADMIN}/notification/create`)}
          >
            <FiPlus size={15} /> Tạo thông báo
          </button>
        )}
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
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <div className="book-filter-group">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả loại</option>
            {Object.entries(NOTIF_TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {NOTIF_TYPE_ICON[k]} {v}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(NOTIF_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {NOTIF_STATUS_ICON[k]} {v}
              </option>
            ))}
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

      {/* Table */}
      <div className="book-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th style={{ width: 130 }}>Loại</th>
              <th style={{ width: 130, textAlign: "center" }}>Trạng thái</th>
              <th style={{ width: 140 }}>Đối tượng</th>
              <th style={{ width: 100, textAlign: "center" }}>Đã gửi</th>
              <th style={{ width: 90, textAlign: "center" }}>Đã đọc</th>
              <th style={{ width: 130 }}>Thời gian</th>
              <th style={{ width: 110, textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(8)].map((__, j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ height: 16, borderRadius: 4 }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : notifications.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <FiBell
                    size={36}
                    style={{
                      opacity: 0.25,
                      display: "block",
                      margin: "0 auto 12px",
                    }}
                  />
                  Không có thông báo nào
                </td>
              </tr>
            ) : (
              notifications.map((n, index) => (
                <tr
                  key={n.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 20}ms` }}
                >
                  {/* Tiêu đề */}
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {n.title}
                    </div>
                    {n.createdBy && (
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        Tạo bởi: {n.createdBy}
                      </div>
                    )}
                  </td>

                  {/* Loại */}
                  <td>
                    <span
                      className={`notif-type-badge ${NOTIF_TYPE_CLASS[n.type]}`}
                    >
                      {NOTIF_TYPE_ICON[n.type]}{" "}
                      {NOTIF_TYPE_LABEL[n.type] ?? n.type}
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td style={{ textAlign: "center" }}>
                    <span
                      className={`notif-status-badge ${NOTIF_STATUS_CLASS[n.status]}`}
                    >
                      {NOTIF_STATUS_ICON[n.status]}{" "}
                      {NOTIF_STATUS_LABEL[n.status] ?? n.status}
                    </span>
                  </td>

                  {/* Đối tượng */}
                  <td>
                    <span className="audience-badge">
                      {AUDIENCE_ICON[n.audienceType]}{" "}
                      {AUDIENCE_LABEL[n.audienceType] ?? n.audienceType ?? "—"}
                    </span>
                  </td>

                  {/* Tổng người nhận */}
                  <td
                    style={{
                      textAlign: "center",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {n.totalRecipients ?? 0}
                  </td>

                  {/* Đã đọc */}
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "var(--success)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {n.readCount ?? 0}
                    </div>
                    {n.totalRecipients > 0 && (
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {Math.round((n.readCount / n.totalRecipients) * 100)}%
                      </div>
                    )}
                  </td>

                  {/* Thời gian */}
                  <td
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {n.status === "SCHEDULED" && n.scheduledAt ? (
                      <>
                        <span
                          style={{ color: "var(--warning)", fontWeight: 600 }}
                        >
                          Lịch:{" "}
                        </span>
                        {formatDate(n.scheduledAt, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    ) : n.sentAt ? (
                      <>
                        <span
                          style={{ color: "var(--success)", fontWeight: 600 }}
                        >
                          Gửi:{" "}
                        </span>
                        {formatDate(n.sentAt, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </>
                    ) : (
                      formatDate(n.createdAt, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    )}
                  </td>

                  {/* Hành động */}
                  <td style={{ textAlign: "center" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                      }}
                    >
                      {hasPermission("NOTIFICATION_VIEW") && (
                        <Link to={`/${ADMIN}/notification/detail/${n.id}`}>
                          <button
                            className="btn-icon"
                            data-tooltip="Xem chi tiết"
                          >
                            <FiEye size={14} />
                          </button>
                        </Link>
                      )}
                      {hasPermission("NOTIFICATION_CANCEL") &&
                        n.status === "SCHEDULED" && (
                          <button
                            className="btn-icon"
                            data-tooltip="Hủy lịch gửi"
                            onClick={() =>
                              setModal({
                                type: "cancel",
                                id: n.id,
                                title: n.title,
                              })
                            }
                            style={{
                              borderColor: "rgba(245,158,11,0.3)",
                              color: "var(--warning)",
                            }}
                          >
                            <FiXCircle size={14} />
                          </button>
                        )}
                      {hasPermission("NOTIFICATION_DELETE") &&
                        ["DRAFT", "SCHEDULED"].includes(n.status) && (
                          <button
                            className="btn-icon"
                            data-tooltip="Xóa"
                            onClick={() =>
                              setModal({
                                type: "delete",
                                id: n.id,
                                title: n.title,
                              })
                            }
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
              {Math.min((page + 1) * PAGE_SIZE, totalItems)} / {totalItems}{" "}
              thông báo
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

export default NotificationListPage;
