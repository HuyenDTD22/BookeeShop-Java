import React, { useState, useEffect, useCallback, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiAlertTriangle,
  FiRefreshCw,
  FiSearch,
  FiLock,
} from "react-icons/fi";
import { getRoles, deleteRole } from "../../../services/admin/roleService";
import { AuthContext } from "../../../contexts/AuthContext";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Confirm Delete Modal ── */
const ConfirmModal = ({ role, onConfirm, onCancel, loading }) => (
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
          <FiTrash2 size={18} />
        </div>
        <h3
          style={{
            margin: 0,
            fontSize: "1rem",
            fontFamily: "'Merriweather', serif",
          }}
        >
          Xác nhận xóa nhóm quyền
        </h3>
      </div>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.875rem",
          marginBottom: 8,
          lineHeight: 1.6,
        }}
      >
        Bạn có chắc muốn xóa nhóm quyền{" "}
        <strong style={{ color: "var(--text-primary)" }}>
          "{role?.displayName}"
        </strong>
        ?
      </p>
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
        ⚠ Nhân viên đang được gán nhóm quyền này sẽ mất quyền tương ứng.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="btn-secondary-admin" onClick={onCancel}>
          Hủy
        </button>
        <button
          className="btn-danger-admin"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? (
            <div
              className="spinner"
              style={{ width: 14, height: 14, borderWidth: 2 }}
            />
          ) : (
            <FiTrash2 size={14} />
          )}
          Xóa nhóm quyền
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
      border: `1px solid ${
        type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"
      }`,
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
   RoleListPage
═══════════════════════════════════════════ */
const RoleListPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [roles, setRoles] = useState([]);
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getRoles();
      const data = res?.result ?? [];
      setRoles(data);
      setFilteredRoles(data);
    } catch {
      setError("Không thể tải danh sách nhóm quyền.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  /* Live search */
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    const kw = val.toLowerCase().trim();
    if (!kw) {
      setFilteredRoles(roles);
    } else {
      setFilteredRoles(
        roles.filter(
          (r) =>
            r.displayName?.toLowerCase().includes(kw) ||
            r.name?.toLowerCase().includes(kw),
        ),
      );
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilteredRoles(roles);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteRole(deleteTarget.id);
      showToast(`Đã xóa nhóm quyền "${deleteTarget.displayName}"`);
      setDeleteTarget(null);
      fetchRoles();
    } catch (err) {
      showToast(err?.response?.data?.message || "Xóa thất bại.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  /**
   * Role hệ thống (ADMIN, USER) không được phép chỉnh sửa hay xóa.
   */
  const isSystemRole = (role) => role.name === "ADMIN" || role.name === "USER";

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <ConfirmModal
          role={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý nhóm quyền</h1>
          <p className="page-subtitle">
            {roles.length} nhóm quyền trong hệ thống
          </p>
        </div>
        {user?.isAdmin && (
          <button
            className="btn-primary-admin"
            onClick={() => navigate(`/${ADMIN}/role/create`)}
          >
            <FiPlus size={15} /> Tạo nhóm quyền
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
        <div className="book-search-wrap">
          <FiSearch size={15} className="search-icon" />
          <input
            className="book-search-input"
            placeholder="Tìm theo tên nhóm quyền..."
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
        <div className="book-filter-group">
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
              <th>Tên nhóm quyền</th>
              <th style={{ width: 280 }}>Mã kỹ thuật</th>
              <th style={{ width: 140, textAlign: "center" }}>Loại</th>
              <th style={{ width: 120, textAlign: "center" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((__, j) => (
                    <td key={j}>
                      <div
                        className="skeleton"
                        style={{ height: 16, borderRadius: 4 }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredRoles.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "48px 0",
                    color: "var(--text-muted)",
                  }}
                >
                  <FiShield
                    size={36}
                    style={{
                      opacity: 0.25,
                      display: "block",
                      margin: "0 auto 12px",
                    }}
                  />
                  {searchInput
                    ? "Không tìm thấy nhóm quyền phù hợp"
                    : "Chưa có nhóm quyền nào"}
                </td>
              </tr>
            ) : (
              filteredRoles.map((role, index) => (
                <tr
                  key={role.id}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* STT */}
                  <td
                    style={{
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {index + 1}
                  </td>

                  {/* Tên nhóm quyền */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "var(--radius-sm)",
                          background: isSystemRole(role)
                            ? "var(--warning-bg)"
                            : "var(--accent-bg)",
                          border: `1px solid ${
                            isSystemRole(role)
                              ? "rgba(245,158,11,0.2)"
                              : "rgba(26,109,196,0.15)"
                          }`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: isSystemRole(role)
                            ? "var(--warning)"
                            : "var(--accent)",
                          flexShrink: 0,
                        }}
                      >
                        {isSystemRole(role) ? (
                          <FiLock size={14} />
                        ) : (
                          <FiShield size={14} />
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "var(--text-primary)",
                        }}
                      >
                        {role.displayName}
                      </span>
                    </div>
                  </td>

                  {/* Mã kỹ thuật */}
                  <td>
                    <code
                      style={{
                        fontSize: "0.78rem",
                        fontFamily: "monospace",
                        background: "var(--bg-raised)",
                        border: "1px solid var(--border-subtle)",
                        padding: "3px 8px",
                        borderRadius: 4,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {role.name}
                    </code>
                  </td>

                  {/* Loại */}
                  <td style={{ textAlign: "center" }}>
                    {isSystemRole(role) ? (
                      <span className="badge-admin badge-warning">
                        <FiLock size={10} /> Hệ thống
                      </span>
                    ) : (
                      <span className="badge-admin badge-info">
                        <FiShield size={10} /> Nhân viên
                      </span>
                    )}
                  </td>

                  {/* Hành động */}
                  <td style={{ textAlign: "center" }}>
                    {isSystemRole(role) ? (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                          fontStyle: "italic",
                        }}
                      >
                        Không thể sửa
                      </span>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Link to={`/${ADMIN}/role/edit/${role.id}`}>
                          <button className="btn-icon" data-tooltip="Chỉnh sửa">
                            <FiEdit2 size={14} />
                          </button>
                        </Link>
                        <button
                          className="btn-icon"
                          data-tooltip="Xóa"
                          onClick={() => setDeleteTarget(role)}
                          style={{
                            borderColor: "rgba(239,68,68,0.3)",
                            color: "var(--danger)",
                          }}
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleListPage;
