import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  FiSave,
  FiAlertTriangle,
  FiRefreshCw,
  FiCheck,
  FiShield,
  FiInfo,
} from "react-icons/fi";
import {
  getRoles,
  getPermissions,
  setRolePermissions,
} from "../../../services/admin/roleService";
import { AuthContext } from "../../../contexts/AuthContext";
import "../../../styles/admin/book.css";

const DISPLAY_NAME_FALLBACK = {
  USER_CREATE: "Tạo tài khoản",
  USER_UPDATE: "Cập nhật tài khoản",
  USER_VIEW: "Xem tài khoản",
  USER_DELETE: "Xóa tài khoản",
  CUSTOMER_CREATE: "Thêm khách hàng",
  CUSTOMER_UPDATE: "Chỉnh sửa khách hàng",
  CUSTOMER_LIST_VIEW: "Xem danh sách khách hàng",
  CUSTOMER_VIEW: "Xem chi tiết khách hàng",
  CUSTOMER_DELETE: "Xóa khách hàng",
  STAFF_CREATE: "Thêm nhân viên",
  STAFF_UPDATE: "Chỉnh sửa nhân viên",
  STAFF_LIST_VIEW: "Xem danh sách nhân viên",
  STAFF_VIEW: "Xem chi tiết nhân viên",
  STAFF_DELETE: "Xóa nhân viên",
  ROLE_CREATE: "Tạo nhóm quyền",
  ROLE_UPDATE: "Chỉnh sửa nhóm quyền",
  ROLE_LIST_VIEW: "Xem danh sách nhóm quyền",
  ROLE_VIEW: "Xem chi tiết nhóm quyền",
  ROLE_DELETE: "Xóa nhóm quyền",
  BOOK_CREATE: "Thêm sách",
  BOOK_UPDATE: "Chỉnh sửa sách",
  BOOK_LIST_VIEW: "Xem danh sách sách",
  BOOK_VIEW: "Xem chi tiết sách",
  BOOK_DELETE: "Xóa sách",
  CATEGORY_CREATE: "Thêm danh mục",
  CATEGORY_UPDATE: "Chỉnh sửa danh mục",
  CATEGORY_LIST_VIEW: "Xem danh sách danh mục",
  CATEGORY_VIEW: "Xem chi tiết danh mục",
  CATEGORY_DELETE: "Xóa danh mục",
  ORDER_APPROVE: "Duyệt / đổi trạng thái đơn",
  ORDER_UPDATE: "Chỉnh sửa đơn hàng",
  ORDER_LIST_VIEW: "Xem danh sách đơn hàng",
  ORDER_VIEW: "Xem chi tiết đơn hàng",
  ORDER_DELETE: "Xóa đơn hàng",
  RATING_VIEW: "Xem đánh giá sách",
  COMMENT_LIST_VIEW: "Xem danh sách bình luận",
  COMMENT_REPLY: "Phản hồi bình luận",
  COMMENT_DELETE: "Xóa bình luận",
  NOTIFICATION_CREATE: "Tạo thông báo",
  NOTIFICATION_UPDATE: "Chỉnh sửa thông báo",
  NOTIFICATION_LIST_VIEW: "Xem danh sách thông báo",
  NOTIFICATION_VIEW: "Xem chi tiết thông báo",
  NOTIFICATION_DELETE: "Xóa thông báo",
  NOTIFICATION_CANCEL: "Huỷ thông báo đã lên lịch",
};

const getDisplayName = (perm) => {
  if (perm.displayName && perm.displayName.trim()) return perm.displayName;
  return DISPLAY_NAME_FALLBACK[perm.name] ?? perm.name;
};

const PERMISSION_GROUPS = [
  {
    label: "Sách",
    keys: [
      "BOOK_LIST_VIEW",
      "BOOK_VIEW",
      "BOOK_CREATE",
      "BOOK_UPDATE",
      "BOOK_DELETE",
    ],
  },
  {
    label: "Danh mục",
    keys: [
      "CATEGORY_LIST_VIEW",
      "CATEGORY_VIEW",
      "CATEGORY_CREATE",
      "CATEGORY_UPDATE",
      "CATEGORY_DELETE",
    ],
  },
  {
    label: "Đơn hàng",
    keys: [
      "ORDER_LIST_VIEW",
      "ORDER_VIEW",
      "ORDER_APPROVE",
      "ORDER_UPDATE",
      "ORDER_DELETE",
    ],
  },
  {
    label: "Khách hàng",
    keys: [
      "CUSTOMER_LIST_VIEW",
      "CUSTOMER_VIEW",
      "CUSTOMER_CREATE",
      "CUSTOMER_UPDATE",
      "CUSTOMER_DELETE",
    ],
  },
  {
    label: "Nhân sự",
    keys: [
      "STAFF_LIST_VIEW",
      "STAFF_VIEW",
      "STAFF_CREATE",
      "STAFF_UPDATE",
      "STAFF_DELETE",
    ],
  },
  {
    label: "Nhóm quyền",
    keys: [
      "ROLE_LIST_VIEW",
      "ROLE_VIEW",
      "ROLE_CREATE",
      "ROLE_UPDATE",
      "ROLE_DELETE",
    ],
  },
  {
    label: "Bình luận",
    keys: ["COMMENT_LIST_VIEW", "COMMENT_REPLY", "COMMENT_DELETE"],
  },
  {
    label: "Đánh giá",
    keys: ["RATING_VIEW"],
  },
  {
    label: "Thông báo",
    keys: [
      "NOTIFICATION_LIST_VIEW",
      "NOTIFICATION_VIEW",
      "NOTIFICATION_CREATE",
      "NOTIFICATION_UPDATE",
      "NOTIFICATION_DELETE",
      "NOTIFICATION_CANCEL",
    ],
  },
];

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

/* ── Checkbox cell ── */
const PermCheckbox = ({ checked, onChange }) => (
  <td style={{ textAlign: "center", padding: "10px 8px" }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{
        width: 16,
        height: 16,
        accentColor: "var(--accent)",
        cursor: "pointer",
      }}
    />
  </td>
);

/* ══════════════════════════════════════════
   PermissionsPage
═══════════════════════════════════════════ */
const PermissionsPage = () => {
  const { user } = useContext(AuthContext);

  const [roles, setRoles] = useState([]);
  const [permissionsMap, setPermissionsMap] = useState({});
  const [draftState, setDraftState] = useState({});
  const [savedState, setSavedState] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [rolesRes, permsRes] = await Promise.all([
        getRoles(),
        getPermissions(),
      ]);

      const rolesData = rolesRes?.result ?? [];
      const permsData = permsRes?.result ?? [];

      const pMap = {};
      permsData.forEach((p) => {
        pMap[p.name] = p;
      });
      setPermissionsMap(pMap);

      const staffRolesData = rolesData.filter(
        (r) => r.name !== "ADMIN" && r.name !== "USER",
      );
      setRoles(staffRolesData);

      const draft = {};
      staffRolesData.forEach((role) => {
        draft[role.id] = new Set((role.permissions ?? []).map((p) => p.id));
      });
      setDraftState(draft);
      setSavedState(
        Object.fromEntries(
          Object.entries(draft).map(([k, v]) => [k, new Set(v)]),
        ),
      );
    } catch {
      setError("Không thể tải dữ liệu phân quyền.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggle = (roleId, permId) => {
    setDraftState((prev) => {
      const next = { ...prev };
      const set = new Set(next[roleId]);
      set.has(permId) ? set.delete(permId) : set.add(permId);
      next[roleId] = set;
      return next;
    });
  };

  const handleSaveRole = async (role) => {
    try {
      setSavingRoleId(role.id);
      const permissionIds = [...(draftState[role.id] ?? [])];
      await setRolePermissions(role.id, permissionIds);
      setSavedState((prev) => ({
        ...prev,
        [role.id]: new Set(draftState[role.id]),
      }));
      showToast(`Đã lưu phân quyền cho "${role.displayName}"`);
    } catch (err) {
      showToast(err?.response?.data?.message || "Lưu thất bại.", "error");
    } finally {
      setSavingRoleId(null);
    }
  };

  const isDirty = (roleId) => {
    const draft = draftState[roleId];
    const saved = savedState[roleId];
    if (!draft || !saved) return false;
    if (draft.size !== saved.size) return true;
    for (const id of draft) {
      if (!saved.has(id)) return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Phân quyền</h1>
            <p className="page-subtitle">Đang tải dữ liệu...</p>
          </div>
        </div>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <div
                className="skeleton"
                style={{ height: 16, borderRadius: 4 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Phân quyền</h1>
          <p className="page-subtitle">
            Quản lý quyền truy cập cho từng nhóm nhân viên
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={fetchData}
          title="Tải lại"
        >
          <FiRefreshCw size={14} /> Tải lại
        </button>
      </div>

      {error && (
        <div
          className="alert-admin alert-danger-admin animate-fadeIn"
          style={{ marginBottom: 20 }}
        >
          <FiAlertTriangle size={15} /> {error}
        </div>
      )}

      <div
        className="alert-admin animate-fadeIn"
        style={{
          background: "var(--info-bg)",
          border: "1px solid rgba(59,130,246,0.2)",
          color: "var(--text-secondary)",
          marginBottom: 20,
          fontSize: "0.82rem",
        }}
      >
        <FiInfo size={14} style={{ color: "var(--info)", flexShrink: 0 }} />
        <span>
          Tick chọn quyền cho từng nhóm, sau đó bấm <strong>Lưu</strong> trên
          cột tương ứng để cập nhật. Quyền của <strong>Quản trị viên</strong>{" "}
          được quản lý tự động bởi hệ thống.
        </span>
      </div>

      {roles.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "var(--text-muted)",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <FiShield
            size={40}
            style={{ opacity: 0.2, display: "block", margin: "0 auto 14px" }}
          />
          <p style={{ fontSize: "0.9rem" }}>
            Chưa có nhóm quyền nhân viên nào.
          </p>
          <p style={{ fontSize: "0.82rem" }}>
            Vui lòng tạo nhóm quyền tại trang{" "}
            <strong>Quản lý nhóm quyền</strong>.
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              className="admin-table"
              style={{ minWidth: 360 + roles.length * 170 }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: 260,
                      position: "sticky",
                      left: 0,
                      background: "var(--bg-raised)",
                      zIndex: 2,
                      borderRight: "2px solid var(--border)",
                    }}
                  >
                    Quyền
                  </th>

                  {roles.map((role) => (
                    <th
                      key={role.id}
                      style={{
                        textAlign: "center",
                        minWidth: 170,
                        verticalAlign: "bottom",
                        padding: "14px 8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: "var(--radius-sm)",
                            background: "var(--accent-bg)",
                            border: "1px solid rgba(26,109,196,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--accent)",
                          }}
                        >
                          <FiShield size={15} />
                        </div>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            textAlign: "center",
                            lineHeight: 1.3,
                          }}
                        >
                          {role.displayName}
                        </span>
                        <button
                          className={
                            isDirty(role.id)
                              ? "btn-primary-admin"
                              : "btn-secondary-admin"
                          }
                          style={{
                            padding: "5px 14px",
                            fontSize: "0.75rem",
                            opacity: savingRoleId === role.id ? 0.75 : 1,
                          }}
                          onClick={() => handleSaveRole(role)}
                          disabled={
                            savingRoleId === role.id || !isDirty(role.id)
                          }
                        >
                          {savingRoleId === role.id ? (
                            <div
                              className="spinner"
                              style={{ width: 12, height: 12, borderWidth: 2 }}
                            />
                          ) : isDirty(role.id) ? (
                            <FiSave size={12} />
                          ) : (
                            <FiCheck size={12} />
                          )}
                          {isDirty(role.id) ? "Lưu*" : "Đã lưu"}
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {PERMISSION_GROUPS.map((group) => {
                  const groupPerms = group.keys
                    .map((key) => permissionsMap[key])
                    .filter(Boolean);
                  if (groupPerms.length === 0) return null;

                  return (
                    <React.Fragment key={group.label}>
                      <tr>
                        <td
                          colSpan={roles.length + 1}
                          style={{
                            background: "var(--bg-raised)",
                            borderTop: "2px solid var(--border)",
                            borderBottom: "1px solid var(--border)",
                            padding: "8px 20px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "var(--text-muted)",
                            }}
                          >
                            {group.label}
                          </span>
                        </td>
                      </tr>

                      {groupPerms.map((perm) => (
                        <tr key={perm.id}>
                          <td
                            style={{
                              position: "sticky",
                              left: 0,
                              background: "var(--bg-surface)",
                              borderRight: "2px solid var(--border)",
                              zIndex: 1,
                              padding: "10px 20px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--text-primary)",
                              }}
                            >
                              {getDisplayName(perm)}
                            </span>
                          </td>

                          {roles.map((role) => (
                            <PermCheckbox
                              key={role.id}
                              checked={
                                draftState[role.id]?.has(perm.id) ?? false
                              }
                              onChange={() => handleToggle(role.id, perm.id)}
                            />
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionsPage;
