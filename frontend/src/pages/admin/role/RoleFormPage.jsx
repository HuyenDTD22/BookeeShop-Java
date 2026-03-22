import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowLeft, FiSave, FiX, FiShield, FiInfo } from "react-icons/fi";
import {
  getRoles,
  createRole,
  updateRole,
} from "../../../services/admin/roleService";
import "../../../styles/admin/book.css";

const ADMIN = process.env.REACT_APP_ADMIN || "admin";

/* ── Field wrapper ── */
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
   RoleFormPage — Create & Edit
═══════════════════════════════════════════ */
const RoleFormPage = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const [form, setForm] = useState({ name: "", displayName: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* Load role data for edit — gọi getAll rồi filter theo id */
  useEffect(() => {
    if (!isEdit || !id) return;
    setFetchLoading(true);
    getRoles()
      .then((res) => {
        const roles = res?.result ?? [];
        const role = roles.find((r) => r.id === id);
        if (!role) throw new Error("Not found");
        // Bỏ prefix STAFF_ trước khi hiển thị vào input
        const nameWithoutPrefix = role.name?.startsWith("STAFF_")
          ? role.name.replace(/^STAFF_/, "")
          : (role.name ?? "");
        setForm({
          name: nameWithoutPrefix,
          displayName: role.displayName ?? "",
        });
      })
      .catch(() => showToast("Không thể tải thông tin nhóm quyền", "error"))
      .finally(() => setFetchLoading(false));
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.displayName.trim())
      errs.displayName = "Vui lòng nhập tên hiển thị";
    if (form.displayName.trim().length > 100)
      errs.displayName = "Tên hiển thị không vượt quá 100 ký tự";
    if (!form.name.trim()) errs.name = "Vui lòng nhập mã nhóm quyền";
    if (!/^[A-Za-z0-9_]+$/.test(form.name.trim()))
      errs.name = "Mã chỉ được chứa chữ cái, số và dấu gạch dưới";
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
      const payload = {
        name: form.name.trim().toUpperCase(),
        displayName: form.displayName.trim(),
      };

      if (isEdit) {
        await updateRole(id, payload);
        showToast("Cập nhật nhóm quyền thành công!");
      } else {
        await createRole(payload);
        showToast("Tạo nhóm quyền mới thành công!");
      }
      setTimeout(() => navigate(`/${ADMIN}/role`), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message;
      showToast(
        msg || (isEdit ? "Cập nhật thất bại" : "Tạo nhóm quyền thất bại"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  /* Loading skeleton */
  if (fetchLoading) {
    return (
      <div style={{ maxWidth: 640 }}>
        {[80, 80].map((h, i) => (
          <div
            key={i}
            style={{
              height: h,
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              marginBottom: 16,
            }}
          >
            <div className="skeleton" style={{ height: "100%" }} />
          </div>
        ))}
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
            border: `1px solid ${
              toast.type === "success"
                ? "rgba(16,185,129,0.3)"
                : "rgba(239,68,68,0.3)"
            }`,
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
        <Link to={`/${ADMIN}/role`}>Quản lý nhóm quyền</Link>
        <span className="breadcrumb-sep">›</span>
        <span style={{ color: "var(--text-primary)" }}>
          {isEdit ? "Chỉnh sửa nhóm quyền" : "Tạo nhóm quyền mới"}
        </span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Chỉnh sửa nhóm quyền" : "Tạo nhóm quyền mới"}
          </h1>
          <p className="page-subtitle">
            {isEdit
              ? "Cập nhật thông tin nhóm quyền"
              : "Tạo nhóm quyền mới để gán cho nhân viên"}
          </p>
        </div>
        <button
          className="btn-secondary-admin"
          onClick={() => navigate(`/${ADMIN}/role`)}
        >
          <FiArrowLeft size={14} /> Quay lại
        </button>
      </div>

      {/* Form — giới hạn width cho gọn */}
      <div style={{ maxWidth: 640 }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-section">
            <div className="form-section-header">
              <FiShield size={14} style={{ color: "var(--accent)" }} />
              <h3 className="form-section-title">Thông tin nhóm quyền</h3>
            </div>
            <div className="form-section-body">
              {/* Tên hiển thị */}
              <Field
                label="Tên hiển thị"
                required
                error={errors.displayName}
                hint='Tên thân thiện hiển thị trên giao diện, ví dụ: "Nhân viên quản lý đơn hàng"'
              >
                <input
                  name="displayName"
                  className="form-control-admin"
                  placeholder="Nhân viên quản lý đơn hàng"
                  value={form.displayName}
                  onChange={handleChange}
                  style={
                    errors.displayName ? { borderColor: "var(--danger)" } : {}
                  }
                />
              </Field>

              {/* Mã nhóm quyền */}
              <Field
                label="Mã nhóm quyền"
                required
                error={errors.name}
                hint={
                  form.name.trim()
                    ? `Sẽ được lưu thành: STAFF_${form.name
                        .trim()
                        .toUpperCase()}`
                    : 'Chỉ chứa chữ cái, số và dấu gạch dưới. Backend tự thêm prefix "STAFF_"'
                }
              >
                {/* Input có prefix STAFF_ hiển thị cố định bên trái */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      padding: "9px 12px",
                      background: "var(--bg-raised)",
                      border: "1px solid var(--border)",
                      borderRight: "none",
                      borderRadius: "var(--radius-sm) 0 0 var(--radius-sm)",
                      fontSize: "0.875rem",
                      color: "var(--text-muted)",
                      fontFamily: "monospace",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                      flexShrink: 0,
                    }}
                  >
                    STAFF_
                  </div>
                  <input
                    name="name"
                    className="form-control-admin"
                    placeholder="ORDER_MANAGER"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9_]/g, ""),
                      }))
                    }
                    style={{
                      borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                      fontFamily: "monospace",
                      ...(errors.name ? { borderColor: "var(--danger)" } : {}),
                    }}
                  />
                </div>
              </Field>

              {/* Info note */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 14px",
                  background: "var(--info-bg)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "var(--radius-sm)",
                  marginTop: 4,
                }}
              >
                <FiInfo
                  size={15}
                  style={{
                    color: "var(--info)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Sau khi tạo nhóm quyền, vào trang <strong>Phân quyền</strong>{" "}
                  để gán các quyền cụ thể. Nhóm quyền sau đó có thể được gán cho
                  nhân viên khi tạo hoặc chỉnh sửa tài khoản.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="form-submit-area">
            <button
              type="submit"
              className="btn-primary-admin"
              disabled={loading}
              style={{
                padding: "11px 28px",
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: 16, height: 16, borderWidth: 2 }}
                  />
                  Đang lưu...
                </>
              ) : (
                <>
                  <FiSave size={15} />
                  {isEdit ? "Lưu thay đổi" : "Tạo nhóm quyền"}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn-secondary-admin"
              onClick={() => navigate(`/${ADMIN}/role`)}
              style={{ padding: "11px 16px" }}
            >
              <FiX size={15} /> Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormPage;
