import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiPlus,
  FiAlertTriangle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
} from "react-icons/fi";
import {
  getStaffs,
  toggleLockStaff,
  deleteStaff,
  getRoles,
} from "../../../services/admin/staffService";
import { formatDate } from "../../../utils/format";
import { AuthContext } from "../../../contexts/AuthContext";
import "../../../styles/admin/customer.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";
const PAGE_SIZE = 10;

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

/* ── Avatar ── */
const Avatar = ({ user, size = 38 }) => {
  const initial = (user?.fullName || user?.username || "?")[0]?.toUpperCase();
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid var(--border)",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #1a6dc4, #7c3aed)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.35,
        fontWeight: 700,
        border: "2px solid rgba(124,58,237,0.2)",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
};

/* ══════════════════════════════════════════
   StaffListPage
═══════════════════════════════════════════ */
const StaffListPage = () => {
  const navigate = useNavigate();
  const { hasPermission } = useContext(AuthContext);

  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  /* Filters */
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [locked, setLocked] = useState("");
  const [roleId, setRoleId] = useState("");
  const [sortVal, setSortVal] = useState("createdAt__desc");

  /* Modal & action */
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load roles cho filter — chỉ lấy role STAFF_, hiển thị displayName */
  useEffect(() => {
    getRoles()
      .then((res) => {
        const data = res?.result ?? [];
        // Lọc chỉ giữ role nhân viên (STAFF_), bỏ ADMIN và USER
        const staffRoles = (Array.isArray(data) ? data : []).filter((r) =>
          r.name?.startsWith("STAFF_"),
        );
        setRoles(staffRoles);
      })
      .catch(() => {});
  }, []);

  /* Fetch staffs */
  const fetchStaffs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [sortBy, sortDir] = sortVal.split("__");
      const params = {
        page,
        size: PAGE_SIZE,
        sortBy,
        sortDir,
        ...(keyword && { keyword }),
        ...(roleId && { roleId }),
        ...(locked !== "" && { locked: locked === "true" }),
      };
      const res = await getStaffs(params);
      const data = res?.result;
      setStaffs(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalItems(data?.totalElements || 0);
    } catch {
      setError("Không thể tải danh sách nhân viên.");
    } finally {
      setLoading(false);
    }
  }, [page, sortVal, keyword, locked, roleId]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchInput.trim());
  };

  const handleToggleLock = async () => {
    if (!modal?.user) return;
    try {
      setActionLoading(true);
      await toggleLockStaff(modal.user.id);
      showToast(
        `Đã ${modal.user.locked ? "mở khóa" : "khóa"} tài khoản "${modal.user.fullName || modal.user.username}"`,
      );
      setModal(null);
      fetchStaffs();
    } catch (err) {
      showToast(err?.response?.data?.message || "Thao tác thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modal?.user) return;
    try {
      setActionLoading(true);
      await deleteStaff(modal.user.id);
      showToast(
        `Đã xóa tài khoản "${modal.user.fullName || modal.user.username}"`,
      );
      setModal(null);
      fetchStaffs();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setKeyword("");
    setLocked("");
    setRoleId("");
    setSortVal("createdAt__desc");
    setPage(0);
  };

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {modal?.type === "delete" && (
        <ConfirmModal
          title="Xác nhận xóa nhân viên"
          message={
            <>
              Bạn có chắc muốn xóa tài khoản{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{modal.user.fullName || modal.user.username}"
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
      {modal?.type === "lock" && (
        <ConfirmModal
          title={modal.user.locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
          message={
            <>
              Bạn có chắc muốn {modal.user.locked ? "mở khóa" : "khóa"} tài
              khoản{" "}
              <strong style={{ color: "var(--text-primary)" }}>
                "{modal.user.fullName || modal.user.username}"
              </strong>
              ?
            </>
          }
          confirmLabel={modal.user.locked ? "Mở khóa" : "Khóa"}
          confirmClass={
            modal.user.locked ? "btn-primary-admin" : "btn-danger-admin"
          }
          icon={modal.user.locked ? FiUnlock : FiLock}
          onConfirm={handleToggleLock}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý nhân sự</h1>
          <p className="page-subtitle">{totalItems} nhân viên trong hệ thống</p>
        </div>
        {hasPermission("STAFF_CREATE") && (
          <button
            className="btn-primary-admin"
            onClick={() => navigate(`/${ADMIN}/staff/create`)}
          >
            <FiPlus size={15} /> Thêm nhân viên
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

      {/* Toolbar */}
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
          {/* Lọc theo role — hiển thị displayName, chỉ role STAFF_ */}
          <select
            className="filter-select"
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value);
              setPage(0);
            }}
            style={{ minWidth: 180 }}
          >
            <option value="">Tất cả vai trò</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.displayName}
              </option>
            ))}
          </select>

          {/* Lọc theo trạng thái */}
          <select
            className="filter-select"
            value={locked}
            onChange={(e) => {
              setLocked(e.target.value);
              setPage(0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="false">Hoạt động</option>
            <option value="true">Đã khóa</option>
          </select>

          {/* Sort */}
          <select
            className="filter-select"
            value={sortVal}
            onChange={(e) => {
              setSortVal(e.target.value);
              setPage(0);
            }}
          >
            <option value="createdAt__desc">Mới nhất</option>
            <option value="createdAt__asc">Cũ nhất</option>
            <option value="fullName__asc">Tên A→Z</option>
            <option value="fullName__desc">Tên Z→A</option>
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

      {/* Table */}
      <div className="book-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 44, textAlign: "center" }}>STT</th>
              <th style={{ width: 52 }}>Ảnh</th>
              <th>Nhân viên</th>
              <th style={{ width: 140 }}>Số điện thoại</th>
              <th style={{ width: 180 }}>Vai trò</th>
              <th style={{ width: 130 }}>Ngày tạo</th>
              <th style={{ width: 110, textAlign: "center" }}>Trạng thái</th>
              <th style={{ width: 130, textAlign: "center" }}>Hành động</th>
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
            ) : staffs.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <FiUser
                    size={36}
                    style={{
                      opacity: 0.25,
                      display: "block",
                      margin: "0 auto 12px",
                    }}
                  />
                  Không có nhân viên nào
                </td>
              </tr>
            ) : (
              staffs.map((staff, index) => (
                <tr
                  key={staff.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 25}ms` }}
                >
                  {/* STT */}
                  <td
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {page * PAGE_SIZE + index + 1}
                  </td>

                  {/* Avatar */}
                  <td>
                    <Avatar user={staff} />
                  </td>

                  {/* Tên + username */}
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {staff.fullName || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      @{staff.username}
                    </div>
                  </td>

                  {/* SĐT */}
                  <td
                    style={{
                      fontSize: "0.875rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {staff.phone || "—"}
                  </td>

                  {/* Vai trò — hiển thị displayName */}
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {staff.roles?.slice(0, 2).map((role) => (
                        <span
                          key={role.id}
                          className="badge-admin badge-info"
                          style={{ fontSize: "0.7rem", padding: "2px 7px" }}
                        >
                          {role.displayName}
                        </span>
                      ))}
                      {staff.roles?.length > 2 && (
                        <span
                          className="badge-admin badge-muted"
                          style={{ fontSize: "0.7rem", padding: "2px 7px" }}
                        >
                          +{staff.roles.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Ngày tạo */}
                  <td
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {formatDate(staff.createdAt)}
                  </td>

                  {/* Trạng thái */}
                  <td style={{ textAlign: "center" }}>
                    {staff.locked ? (
                      <span className="badge-admin badge-danger">
                        <FiLock size={11} /> Đã khóa
                      </span>
                    ) : (
                      <span className="badge-admin badge-success">
                        Hoạt động
                      </span>
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
                      {hasPermission("STAFF_VIEW") && (
                        <Link to={`/${ADMIN}/staff/detail/${staff.id}`}>
                          <button
                            className="btn-icon"
                            data-tooltip="Xem chi tiết"
                          >
                            <FiEye size={14} />
                          </button>
                        </Link>
                      )}
                      {hasPermission("STAFF_UPDATE") && (
                        <Link to={`/${ADMIN}/staff/edit/${staff.id}`}>
                          <button className="btn-icon" data-tooltip="Chỉnh sửa">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                      )}
                      {hasPermission("STAFF_UPDATE") && (
                        <button
                          className="btn-icon"
                          data-tooltip={staff.locked ? "Mở khóa" : "Khóa"}
                          onClick={() =>
                            setModal({ type: "lock", user: staff })
                          }
                          style={
                            staff.locked
                              ? {
                                  borderColor: "rgba(16,185,129,0.3)",
                                  color: "var(--success)",
                                }
                              : {
                                  borderColor: "rgba(245,158,11,0.3)",
                                  color: "var(--warning)",
                                }
                          }
                        >
                          {staff.locked ? (
                            <FiUnlock size={14} />
                          ) : (
                            <FiLock size={14} />
                          )}
                        </button>
                      )}
                      {hasPermission("STAFF_DELETE") && (
                        <button
                          className="btn-icon"
                          data-tooltip="Xóa"
                          onClick={() =>
                            setModal({ type: "delete", user: staff })
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
              {Math.min((page + 1) * PAGE_SIZE, totalItems)} / {totalItems} nhân
              viên
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

export default StaffListPage;
